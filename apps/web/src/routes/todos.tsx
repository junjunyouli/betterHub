import {
	BloomAddTaskSheet,
	BloomBottomNav,
	type BloomCategory,
	BloomFloatingAddButton,
	BloomHeader,
	BloomPage,
	BloomProgressCard,
	type BloomTask,
	BloomTaskItem,
} from "@betterHub/ui/components/daily-bloom";
import { Skeleton } from "@betterHub/ui/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function formatTaskMeta(
	category: BloomCategory,
	dueAt: Date | string | null
): string {
	if (!dueAt) {
		return `No due date • ${category}`;
	}
	const due = new Date(dueAt);
	const label = due.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${label} • ${category}`;
}

export const Route = createFileRoute("/todos")({
	component: TodosRoute,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
	},
});

function TodosRoute() {
	const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
	const { user } = useCurrentUser();
	const userName = user?.name ?? "User";

	const todos = useQuery(trpc.todo.getToday.queryOptions());
	const stats = useQuery(trpc.todo.getStats.queryOptions());

	const refetchAll = () => {
		todos.refetch();
		stats.refetch();
	};

	const createMutation = useMutation(
		trpc.todo.create.mutationOptions({
			onSuccess: () => {
				refetchAll();
				setIsAddTaskOpen(false);
			},
		})
	);
	const toggleMutation = useMutation(
		trpc.todo.toggle.mutationOptions({
			onSuccess: () => {
				refetchAll();
			},
		})
	);
	const deleteMutation = useMutation(
		trpc.todo.delete.mutationOptions({
			onSuccess: () => {
				refetchAll();
			},
		})
	);

	const taskItems: BloomTask[] =
		todos.data?.map((item) => ({
			completed: item.completed,
			id: item.id,
			meta: formatTaskMeta(item.category, item.dueAt),
			title: item.title,
		})) ?? [];

	const handleToggleTodo = (id: number, completed: boolean) => {
		toggleMutation.mutate({ id, completed: !completed });
	};

	const handleDeleteTodo = (id: number) => {
		deleteMutation.mutate({ id });
	};

	const handleCreateTodo = ({
		text,
		category,
		dueAt,
	}: {
		category: BloomCategory;
		text: string;
		dueAt: Date | null;
	}) => {
		createMutation.mutate({ title: text, category, dueAt });
	};

	let taskContent: ReactNode;

	if (todos.isLoading) {
		taskContent = (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-20 rounded-xl bg-[#e6e8e9]" />
				<Skeleton className="h-20 rounded-xl bg-[#e6e8e9]" />
				<Skeleton className="h-20 rounded-xl bg-[#e6e8e9]" />
			</div>
		);
	} else if (taskItems.length === 0) {
		taskContent = (
			<section className="rounded-xl bg-white p-6 text-center shadow-[0_8px_16px_rgba(0,108,77,0.025)]">
				<h3 className="font-semibold text-[18px] leading-7">No tasks yet</h3>
				<p className="mt-1 text-[#3d4943] text-[14px] leading-5">
					Add your first task to start today's bloom.
				</p>
			</section>
		);
	} else {
		taskContent = (
			<ul className="flex flex-col gap-4">
				{taskItems.map((task) => (
					<BloomTaskItem
						key={task.id}
						onDelete={handleDeleteTodo}
						onToggle={handleToggleTodo}
						task={task}
					/>
				))}
			</ul>
		);
	}

	return (
		<BloomPage>
			<BloomHeader userName={userName} />
			<main className="mx-auto max-w-2xl px-5 pt-24 pb-36">
				<section className="mb-8">
					<h1 className="mb-1 font-bold text-[32px] leading-10">
						Good morning, {userName}!
					</h1>
					<p className="text-[#3d4943] text-[18px] leading-7">
						You're making great progress today.
					</p>
				</section>

				<BloomProgressCard
					completed={stats.data?.completed ?? 0}
					total={stats.data?.total ?? 0}
				/>

				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-[22px] leading-7">Today's Tasks</h2>
					<button
						className="rounded-full bg-[#86f8c8]/30 px-4 py-1 font-semibold text-[#006c4d] text-[12px] leading-4 transition-opacity hover:opacity-80"
						type="button"
					>
						Edit
					</button>
				</div>

				{taskContent}

				<section className="mt-8 overflow-hidden rounded-2xl bg-[#d3e7e2]">
					<img
						alt="Minimal workspace with a plant and soft morning light"
						className="h-48 w-full object-cover opacity-80 grayscale transition-all duration-700 hover:grayscale-0"
						height={384}
						src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
						width={1200}
					/>
				</section>
			</main>
			<BloomFloatingAddButton onClick={() => setIsAddTaskOpen(true)} />
			<BloomBottomNav />
			<BloomAddTaskSheet
				onClose={() => setIsAddTaskOpen(false)}
				onSubmit={handleCreateTodo}
				open={isAddTaskOpen}
				pending={createMutation.isPending}
			/>
		</BloomPage>
	);
}
