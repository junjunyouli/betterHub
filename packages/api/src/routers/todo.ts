import { db } from "@betterHub/db";
import { todo } from "@betterHub/db/schema/todo";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

const TODO_CATEGORIES = ["Work", "Personal", "Home", "Health"] as const;
const categorySchema = z.enum(TODO_CATEGORIES);

/** 给定日期所在自然日的范围（本地时区）：[当天 00:00, 次日 00:00)。 */
function getDayRange(date: Date) {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return { start, end };
}

/** 两个日期是否落在同一自然日（本地时区）。 */
function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/**
 * 指定日期的截止时间条件。今日沿用「无截止时间也算今日」的既有语义；
 * 非今日（明日/自定义日期）仅匹配截止时间落在该自然日范围内的任务。
 */
function dueDateWhere(date: Date) {
	const { start, end } = getDayRange(date);
	if (isSameDay(date, new Date())) {
		return or(
			isNull(todo.dueAt),
			and(gte(todo.dueAt, start), lt(todo.dueAt, end))
		);
	}
	return and(gte(todo.dueAt, start), lt(todo.dueAt, end));
}

/** 今日任务的归属 + 日期条件：本人 且（无截止时间 或 截止落在今日）。 */
function todayWhere(userId: string) {
	return and(eq(todo.userId, userId), dueDateWhere(new Date()));
}

/** `todo.list` 的组合过滤条件：本人 + 可选分类 + 可选日期，服务端 `and` 组合。 */
function listWhere(
	userId: string,
	filters: { category?: (typeof TODO_CATEGORIES)[number]; date?: Date }
) {
	const conditions = [eq(todo.userId, userId)];
	if (filters.category) {
		conditions.push(eq(todo.category, filters.category));
	}
	if (filters.date) {
		const dateCondition = dueDateWhere(filters.date);
		if (dateCondition) {
			conditions.push(dateCondition);
		}
	}
	return and(...conditions);
}

export const todoRouter = router({
	getAll: protectedProcedure.query(
		async ({ ctx }) =>
			await db.select().from(todo).where(eq(todo.userId, ctx.session.user.id))
	),

	getToday: protectedProcedure.query(
		async ({ ctx }) =>
			await db.select().from(todo).where(todayWhere(ctx.session.user.id))
	),

	/**
	 * 分类 + 日期组合筛选（均可选）。`date` 语义与 `getToday` 收敛：
	 * 传入今日日期时包含无截止时间的任务；其余日期仅匹配落在当天的任务。
	 */
	list: protectedProcedure
		.input(
			z.object({
				category: categorySchema.optional(),
				date: z.coerce.date().optional(),
			})
		)
		.query(
			async ({ ctx, input }) =>
				await db
					.select()
					.from(todo)
					.where(listWhere(ctx.session.user.id, input))
		),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		const [row] = await db
			.select({
				total: sql<number>`count(*)::int`,
				completed: sql<number>`count(*) filter (where ${todo.completed})::int`,
			})
			.from(todo)
			.where(todayWhere(ctx.session.user.id));
		const total = row?.total ?? 0;
		const completed = row?.completed ?? 0;
		const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
		return { total, completed, percent };
	}),

	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				category: categorySchema.default("Personal"),
				dueAt: z.coerce.date().nullish(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await db
				.insert(todo)
				.values({
					title: input.title,
					category: input.category,
					dueAt: input.dueAt ?? null,
					userId: ctx.session.user.id,
				})
				.returning({ id: todo.id });
			return created;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).optional(),
				category: categorySchema.optional(),
				dueAt: z.coerce.date().nullish(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...changes } = input;
			const patch: Partial<typeof todo.$inferInsert> = {};
			if (changes.title !== undefined) {
				patch.title = changes.title;
			}
			if (changes.category !== undefined) {
				patch.category = changes.category;
			}
			if (changes.dueAt !== undefined) {
				patch.dueAt = changes.dueAt;
			}
			if (Object.keys(patch).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No fields to update",
				});
			}
			const result = await db
				.update(todo)
				.set(patch)
				.where(and(eq(todo.id, id), eq(todo.userId, ctx.session.user.id)))
				.returning({ id: todo.id });
			if (result.length === 0) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Todo not found" });
			}
			return result[0];
		}),

	toggle: protectedProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.update(todo)
				.set({ completed: input.completed })
				.where(and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)))
				.returning({ id: todo.id });
			if (result.length === 0) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Todo not found" });
			}
			return result[0];
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.delete(todo)
				.where(and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)))
				.returning({ id: todo.id });
			if (result.length === 0) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Todo not found" });
			}
			return result[0];
		}),
});
