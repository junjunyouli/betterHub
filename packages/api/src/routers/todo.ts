import { db } from "@betterHub/db";
import { todo } from "@betterHub/db/schema/todo";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

const TODO_CATEGORIES = ["Work", "Personal", "Home", "Health"] as const;
const categorySchema = z.enum(TODO_CATEGORIES);

/** 今日范围（本地时区）：[今天 00:00, 明天 00:00)。 */
function getTodayRange() {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return { start, end };
}

/** 今日任务的归属 + 日期条件：本人 且（无截止时间 或 截止落在今日）。 */
function todayWhere(userId: string) {
	const { start, end } = getTodayRange();
	return and(
		eq(todo.userId, userId),
		or(isNull(todo.dueAt), and(gte(todo.dueAt, start), lt(todo.dueAt, end)))
	);
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
				dueAt: z.date().nullish(),
			})
		)
		.mutation(
			async ({ ctx, input }) =>
				await db.insert(todo).values({
					title: input.title,
					category: input.category,
					dueAt: input.dueAt ?? null,
					userId: ctx.session.user.id,
				})
		),

	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).optional(),
				category: categorySchema.optional(),
				dueAt: z.date().nullish(),
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
