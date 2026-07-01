import {
	boolean,
	index,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const todoCategory = pgEnum("todo_category", [
	"Work",
	"Personal",
	"Home",
	"Health",
]);

export const todo = pgTable(
	"todo",
	{
		id: serial("id").primaryKey(),
		title: text("title").notNull(),
		completed: boolean("completed").default(false).notNull(),
		category: todoCategory("category").default("Personal").notNull(),
		dueAt: timestamp("due_at"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("todo_userId_idx").on(table.userId),
		index("todo_dueAt_idx").on(table.dueAt),
	]
);
