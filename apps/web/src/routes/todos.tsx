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
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";

import { trpc } from "@/utils/trpc";

const DEFAULT_TASK_META = "Today • Task";

export const Route = createFileRoute("/todos")({
	component: TodosRoute,
});

function TodosRoute() {
	const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

	const todos = useQuery(trpc.todo.getAll.queryOptions());
	const createMutation = useMutation(
		trpc.todo.create.mutationOptions({
			onSuccess: () => {
				todos.refetch();
				setIsAddTaskOpen(false);
			},
		})
	);
	const toggleMutation = useMutation(
		trpc.todo.toggle.mutationOptions({
			onSuccess: () => {
				todos.refetch();
			},
		})
	);
	const deleteMutation = useMutation(
		trpc.todo.delete.mutationOptions({
			onSuccess: () => {
				todos.refetch();
			},
		})
	);

	const taskItems: BloomTask[] =
		todos.data?.map((item) => ({
			completed: item.completed,
			id: item.id,
			meta: DEFAULT_TASK_META,
			title: item.text,
		})) ?? [];

	const completedCount = taskItems.filter((task) => task.completed).length;

	const handleToggleTodo = (id: number, completed: boolean) => {
		toggleMutation.mutate({ id, completed: !completed });
	};

	const handleDeleteTodo = (id: number) => {
		deleteMutation.mutate({ id });
	};

	const handleCreateTodo = ({
		text,
	}: {
		category: BloomCategory;
		text: string;
	}) => {
		createMutation.mutate({ text });
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
			<BloomHeader />
			<main className="mx-auto max-w-2xl px-5 pt-24 pb-36">
				<section className="mb-8">
					<h1 className="mb-1 font-bold text-[32px] leading-10">
						Good morning, User!
					</h1>
					<p className="text-[#3d4943] text-[18px] leading-7">
						You're making great progress today.
					</p>
				</section>

				<BloomProgressCard
					completed={completedCount}
					total={taskItems.length}
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
