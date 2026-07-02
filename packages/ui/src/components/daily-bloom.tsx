import { cn } from "@betterHub/ui/lib/utils";
import {
	Briefcase,
	CalendarDays,
	Check,
	CircleUserRound,
	Clock,
	Heart,
	Home,
	Leaf,
	ListTodo,
	Plus,
	Settings,
	Sparkles,
	Trash2,
	UserRound,
	X,
} from "lucide-react";
import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";

type BloomCategory = "Work" | "Personal" | "Home" | "Health";

interface BloomTask {
	completed: boolean;
	id: number;
	meta: string;
	title: string;
}

interface BloomPageProps {
	children: ReactNode;
	className?: string;
}

type BloomAuthFieldProps = ComponentProps<"input"> & {
	icon?: ReactNode;
	label: string;
	error?: string;
};

interface BloomTaskItemProps {
	onDelete: (id: number) => void;
	onToggle: (id: number, completed: boolean) => void;
	task: BloomTask;
}

interface BloomEditableTask {
	category: BloomCategory;
	dueAt: Date | string | null;
	id: number;
	title: string;
}

interface BloomAddTaskSheetProps {
	/** 传入待编辑任务则进入编辑模式并预填 title/category/dueAt；不传则为新增模式。 */
	initialTask?: BloomEditableTask | null;
	onClose: () => void;
	onSubmit: (task: {
		id?: number;
		text: string;
		category: BloomCategory;
		dueAt: Date | null;
	}) => void;
	open: boolean;
	pending?: boolean;
}

type BloomDueOption = "today" | "tomorrow" | "custom" | null;

/** 将 Date 格式化为 `datetime-local` input 所需的本地时间字符串。 */
function toDatetimeLocalValue(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** 将截止时间选项映射为具体 Date（今天/明天取当日 23:59；自定义解析输入；未选返回 null）。 */
function resolveDueAt(
	option: BloomDueOption,
	customValue: string
): Date | null {
	if (option === "custom") {
		if (!customValue) {
			return null;
		}
		const parsed = new Date(customValue);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	if (option === "today" || option === "tomorrow") {
		const date = new Date();
		if (option === "tomorrow") {
			date.setDate(date.getDate() + 1);
		}
		date.setHours(23, 59, 0, 0);
		return date;
	}
	return null;
}

const categoryOptions: Array<{
	label: BloomCategory;
	icon: ReactNode;
}> = [
	{ label: "Work", icon: <Briefcase data-icon="inline-start" /> },
	{ label: "Personal", icon: <UserRound data-icon="inline-start" /> },
	{ label: "Home", icon: <Home data-icon="inline-start" /> },
	{ label: "Health", icon: <Heart data-icon="inline-start" /> },
];

export function BloomPage({ children, className }: BloomPageProps) {
	return (
		<div
			className={cn(
				"min-h-svh bg-[#f8fafb] font-sans text-[#191c1d] antialiased",
				className
			)}
		>
			{children}
		</div>
	);
}

export function BloomBrandMark({ compact = false }: { compact?: boolean }) {
	return (
		<div className={cn("flex items-center gap-3", compact && "gap-2")}>
			<div
				className={cn(
					"flex items-center justify-center rounded-[22px] bg-[#86f8c8]/60 text-[#006c4d]",
					compact ? "size-10" : "size-16"
				)}
			>
				<ListTodo className={compact ? "size-5" : "size-8"} />
			</div>
			{compact ? (
				<span className="font-semibold text-[#006c4d] text-[22px] leading-7">
					Daily Bloom
				</span>
			) : null}
		</div>
	);
}

export function BloomAuthPanel({
	children,
	subtitle,
	title,
}: {
	children: ReactNode;
	subtitle: string;
	title: string;
}) {
	return (
		<main className="flex min-h-svh items-center justify-center px-5 py-10">
			<div className="fade-in slide-in-from-bottom-4 w-full max-w-[440px] animate-in duration-700">
				<div className="mb-8 flex flex-col items-center text-center">
					<BloomBrandMark />
					<h1 className="mt-6 font-semibold text-[24px] leading-8">{title}</h1>
					<p className="mt-1 text-[#3d4943] text-[16px] leading-6">
						{subtitle}
					</p>
				</div>
				<div className="rounded-[32px] bg-white p-6 shadow-[0_16px_32px_-8px_rgba(0,108,77,0.08)] sm:p-8">
					{children}
				</div>
				<BloomZenTip />
			</div>
		</main>
	);
}

export function BloomAuthField({
	className,
	error,
	icon,
	label,
	...props
}: BloomAuthFieldProps) {
	return (
		<div className="flex flex-col gap-1">
			<label
				className="ml-1 font-semibold text-[#3d4943] text-[12px] leading-4"
				htmlFor={props.id}
			>
				{label}
			</label>
			<div
				className={cn(
					"flex items-center gap-2 rounded-t-xl border-[#e1e3e4] border-b-2 bg-[#f2f4f5]/70 px-4 py-3 transition-colors focus-within:border-[#006c4d] focus-within:bg-white",
					error && "border-[#ba1a1a]"
				)}
			>
				{icon ? (
					<span className="text-[#6d7a72] [&_svg]:size-5">{icon}</span>
				) : null}
				<input
					className={cn(
						"w-full bg-transparent text-[16px] leading-6 outline-none placeholder:text-[#bccac1]",
						className
					)}
					{...props}
				/>
			</div>
			{error ? (
				<p className="ml-1 text-[#ba1a1a] text-[12px] leading-4">{error}</p>
			) : null}
		</div>
	);
}

export function BloomPrimaryButton({
	children,
	className,
	...props
}: ComponentProps<"button">) {
	return (
		<button
			className={cn(
				"inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#006c4d] px-5 font-semibold text-[14px] text-white leading-4 shadow-[0_12px_24px_rgba(0,108,77,0.18)] transition-all hover:scale-[1.01] hover:bg-[#005139] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
				className
			)}
			type="button"
			{...props}
		>
			{children}
		</button>
	);
}

export function BloomHeader({ userName = "User" }: { userName?: string }) {
	return (
		<header className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-[#f8fafb]/85 px-5 py-2 backdrop-blur-md">
			<BloomBrandMark compact />
			<div className="flex items-center gap-2">
				<div className="hidden rounded-full bg-[#f2f4f5] px-3 py-2 text-[#3d4943] text-[12px] sm:block">
					{userName}
				</div>
				<button
					aria-label="Open settings"
					className="flex size-10 items-center justify-center rounded-full text-[#3d4943] transition-colors hover:bg-[#eceeef]"
					type="button"
				>
					<Settings />
				</button>
			</div>
		</header>
	);
}

export function BloomProgressCard({
	completed,
	total,
}: {
	completed: number;
	total: number;
}) {
	const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

	return (
		<section className="mb-8 rounded-xl bg-white p-6 shadow-[0_16px_32px_rgba(0,108,77,0.04)]">
			<div className="mb-2 flex items-end justify-between gap-4">
				<div>
					<span className="font-semibold text-[#006c4d] text-[12px] leading-4">
						DAILY GOAL
					</span>
					<h2 className="font-semibold text-[22px] leading-7">
						{percent}% Completed
					</h2>
				</div>
				<span className="shrink-0 text-[#3d4943] text-[14px] leading-5">
					{completed} of {total} tasks
				</span>
			</div>
			<div className="h-3 overflow-hidden rounded-full bg-[#eceeef]">
				<div
					className="h-full rounded-full bg-[#3eb489] transition-[width] duration-700"
					style={{ width: `${percent}%` }}
				/>
			</div>
		</section>
	);
}

export function BloomTaskItem({
	onDelete,
	onToggle,
	task,
}: BloomTaskItemProps) {
	return (
		<li className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-[0_8px_16px_rgba(0,108,77,0.025)] transition-shadow hover:shadow-[0_12px_24px_rgba(0,108,77,0.06)]">
			<button
				aria-label={
					task.completed ? "Mark task incomplete" : "Mark task complete"
				}
				className={cn(
					"flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-transform active:scale-90",
					task.completed
						? "border-[#3eb489] bg-[#3eb489]/10 text-[#00402d]"
						: "border-[#bccac1] text-transparent hover:border-[#3eb489]"
				)}
				onClick={() => onToggle(task.id, task.completed)}
				type="button"
			>
				<Check className="size-4" />
			</button>
			<div className="min-w-0 flex-1">
				<h3
					className={cn(
						"truncate font-semibold text-[#191c1d] text-[16px] leading-6",
						task.completed && "text-[#6d7a72] line-through opacity-60"
					)}
				>
					{task.title}
				</h3>
				<p className="text-[#6d7a72] text-[10px] leading-[14px]">{task.meta}</p>
			</div>
			<button
				aria-label="Delete task"
				className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#ba1a1a] opacity-100 transition-colors hover:bg-[#ffdad6]/50 sm:opacity-0 sm:group-hover:opacity-100"
				onClick={() => onDelete(task.id)}
				type="button"
			>
				<Trash2 className="size-4" />
			</button>
		</li>
	);
}

export function BloomFloatingAddButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			aria-label="Add task"
			className="fixed right-5 bottom-24 z-30 flex size-14 items-center justify-center rounded-full bg-[#3eb489] text-[#00402d] shadow-lg transition-transform hover:scale-110 active:scale-95"
			onClick={onClick}
			type="button"
		>
			<Plus className="size-7" />
		</button>
	);
}

export function BloomBottomNav() {
	return (
		<nav className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around rounded-t-xl bg-[#f8fafb]/90 px-4 pt-2 pb-6 backdrop-blur-lg">
			<BloomNavItem active icon={<ListTodo />} label="Tasks" />
			<BloomNavItem icon={<CalendarDays />} label="Calendar" />
			<BloomNavItem icon={<Sparkles />} label="Focus" />
			<BloomNavItem icon={<CircleUserRound />} label="Profile" />
		</nav>
	);
}

export function BloomAddTaskSheet({
	initialTask,
	onClose,
	onSubmit,
	open,
	pending,
}: BloomAddTaskSheetProps) {
	const [text, setText] = useState("");
	const [category, setCategory] = useState<BloomCategory>("Work");
	const [dueOption, setDueOption] = useState<BloomDueOption>(null);
	const [customValue, setCustomValue] = useState("");
	const [dueError, setDueError] = useState("");

	const isEditMode = Boolean(initialTask);

	// 每次打开弹窗时按当前模式重新初始化表单：编辑模式预填 title/category/dueAt，新增模式清空。
	useEffect(() => {
		if (!open) {
			return;
		}
		setDueError("");
		if (initialTask) {
			setText(initialTask.title);
			setCategory(initialTask.category);
			if (initialTask.dueAt) {
				const due = new Date(initialTask.dueAt);
				if (Number.isNaN(due.getTime())) {
					setDueOption(null);
					setCustomValue("");
				} else {
					setDueOption("custom");
					setCustomValue(toDatetimeLocalValue(due));
				}
			} else {
				setDueOption(null);
				setCustomValue("");
			}
		} else {
			setText("");
			setCategory("Work");
			setDueOption(null);
			setCustomValue("");
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: initialTask 的引用变化即代表要重新预填，无需拆分成基础类型依赖
	}, [open, initialTask]);

	if (!open) {
		return null;
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedText = text.trim();

		if (!trimmedText) {
			return;
		}

		// 选了「选择时间」但值缺失/无法解析时，给出反馈而非静默丢弃截止时间。
		if (dueOption === "custom") {
			const parsed = customValue ? new Date(customValue) : null;
			if (!parsed || Number.isNaN(parsed.getTime())) {
				setDueError("请选择有效的截止时间，或取消“选择时间”。");
				return;
			}
		}

		onSubmit({
			id: initialTask?.id,
			text: trimmedText,
			category,
			dueAt: resolveDueAt(dueOption, customValue),
		});
		setText("");
		setDueOption(null);
		setCustomValue("");
		setDueError("");
	};

	const toggleDue = (option: Exclude<BloomDueOption, null>) => {
		setDueError("");
		setDueOption((current) => (current === option ? null : option));
	};

	const handleCustomChange = (value: string) => {
		setDueError("");
		setCustomValue(value);
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col justify-end">
			<button
				aria-label="Close add task dialog"
				className="absolute inset-0 bg-[#191c1d]/30 backdrop-blur-sm"
				onClick={onClose}
				type="button"
			/>
			<form
				className="slide-in-from-bottom-full relative animate-in rounded-t-[28px] bg-[#f8fafb] px-5 pt-2 pb-10 shadow-[0_-10px_40px_rgba(0,108,77,0.1)] duration-300"
				onSubmit={handleSubmit}
			>
				<div className="mb-4 flex justify-center">
					<div className="h-1.5 w-12 rounded-full bg-[#bccac1]/50" />
				</div>
				<div className="mb-8 flex items-center justify-between">
					<h2 className="font-semibold text-[22px] leading-7">
						{isEditMode ? "编辑任务" : "新增任务"}
					</h2>
					<button
						aria-label="Close"
						className="flex size-8 items-center justify-center rounded-full bg-[#e6e8e9] text-[#3d4943]"
						onClick={onClose}
						type="button"
					>
						<X className="size-4" />
					</button>
				</div>
				<div className="flex flex-col gap-8">
					<div className="group">
						<label
							className="mb-1 block font-semibold text-[#006c4d] text-[12px] leading-4"
							htmlFor="task-name"
						>
							任务名称
						</label>
						<input
							autoFocus
							className="w-full bg-transparent p-0 font-semibold text-[22px] leading-7 outline-none placeholder:text-[#bccac1]"
							id="task-name"
							onChange={(event) => setText(event.target.value)}
							placeholder="想要完成什么？"
							value={text}
						/>
						<div className="mt-2 h-px w-full bg-[#3eb489]/30 transition-colors group-focus-within:bg-[#006c4d]" />
					</div>
					<div>
						<p className="mb-4 font-semibold text-[#3d4943] text-[12px] leading-4">
							选择分类
						</p>
						<div className="flex flex-wrap gap-2">
							{categoryOptions.map((option) => (
								<button
									className={cn(
										"inline-flex items-center gap-1 rounded-full px-4 py-2 font-semibold text-[12px] leading-4 transition-colors [&_svg]:size-4",
										option.label === category
											? "bg-[#3eb489] text-[#00402d]"
											: "bg-[#e6e8e9] text-[#3d4943] hover:bg-[#e1e3e4]"
									)}
									key={option.label}
									onClick={() => setCategory(option.label)}
									type="button"
								>
									{option.icon}
									{option.label}
								</button>
							))}
						</div>
					</div>
					<div>
						<p className="mb-4 font-semibold text-[#3d4943] text-[12px] leading-4">
							截止时间
						</p>
						<div className="flex gap-2">
							<BloomDateOption
								active={dueOption === "today"}
								icon={<CalendarDays />}
								label="今天"
								onClick={() => toggleDue("today")}
							/>
							<BloomDateOption
								active={dueOption === "tomorrow"}
								icon={<Clock />}
								label="明天"
								onClick={() => toggleDue("tomorrow")}
							/>
							<BloomDateOption
								active={dueOption === "custom"}
								icon={<Clock />}
								label="选择时间"
								onClick={() => toggleDue("custom")}
							/>
						</div>
						{dueOption === "custom" && (
							<input
								aria-invalid={dueError !== ""}
								aria-label="选择截止时间"
								className={cn(
									"mt-3 w-full rounded-xl border bg-[#f2f4f5] px-3 py-2 text-[#191c1d] text-[14px] leading-5 outline-none focus:border-[#006c4d]",
									dueError ? "border-red-500" : "border-[#bccac1]/30"
								)}
								onChange={(event) => handleCustomChange(event.target.value)}
								type="datetime-local"
								value={customValue}
							/>
						)}
						{dueError && (
							<p
								className="mt-2 text-[12px] text-red-600 leading-4"
								role="alert"
							>
								{dueError}
							</p>
						)}
					</div>
					<BloomPrimaryButton
						className="bg-[#3eb489] text-[#00402d]"
						disabled={pending}
						type="submit"
					>
						<ListTodo data-icon="inline-start" />
						{pending ? "正在保存..." : "添加任务"}
					</BloomPrimaryButton>
				</div>
			</form>
		</div>
	);
}

function BloomNavItem({
	active,
	icon,
	label,
}: {
	active?: boolean;
	icon: ReactNode;
	label: string;
}) {
	return (
		<button
			className={cn(
				"flex flex-col items-center justify-center rounded-full px-5 py-1.5 font-semibold text-[12px] leading-4 [&_svg]:size-5",
				active ? "bg-[#3eb489] text-[#00402d]" : "text-[#3d4943]"
			)}
			type="button"
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

function BloomDateOption({
	active,
	icon,
	label,
	onClick,
}: {
	active?: boolean;
	icon: ReactNode;
	label: string;
	onClick?: () => void;
}) {
	return (
		<button
			aria-pressed={active}
			className={cn(
				"flex min-h-20 flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-[14px] leading-5 transition-transform active:scale-95 [&_svg]:size-5 [&_svg]:text-[#006c4d]",
				active
					? "border-[#006c4d] bg-[#86f8c8]/30 text-[#00402d]"
					: "border-[#bccac1]/30 bg-[#f2f4f5] text-[#191c1d]"
			)}
			onClick={onClick}
			type="button"
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

function BloomZenTip() {
	return (
		<section className="mt-8 hidden rounded-[32px] bg-[#eceeef] p-8 md:block">
			<div className="flex items-center justify-between gap-6">
				<div>
					<div className="mb-2 flex items-center gap-1 text-[#006c4d]">
						<Leaf className="size-5" />
						<span className="font-semibold text-[12px] leading-4">
							Daily Zen Tip
						</span>
					</div>
					<p className="max-w-xs text-[#3d4943] text-[16px] italic leading-6">
						Focus on being productive instead of busy.
					</p>
				</div>
				<div className="h-28 w-32 overflow-hidden rounded-3xl bg-[#d3e7e2] shadow-md">
					<img
						alt="Minimal desk with a small plant and morning light"
						className="size-full object-cover"
						height={224}
						src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80"
						width={256}
					/>
				</div>
			</div>
		</section>
	);
}

export type { BloomCategory, BloomTask };
