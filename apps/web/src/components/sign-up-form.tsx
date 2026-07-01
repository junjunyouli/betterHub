import {
	BloomAuthField,
	BloomAuthPanel,
	BloomPrimaryButton,
} from "@betterHub/ui/components/daily-bloom";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lock, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/todos",
						});
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<BloomAuthPanel
			subtitle="Join our community of mindful growers and start your daily bloom journey."
			title="Create Account"
		>
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<BloomAuthField
							error={field.state.meta.errors.at(0)?.message}
							icon={<UserRound />}
							id={field.name}
							label="Full Name"
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Full Name"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<BloomAuthField
							error={field.state.meta.errors.at(0)?.message}
							icon={<Mail />}
							id={field.name}
							label="Email Address"
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Email Address"
							type="email"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<BloomAuthField
							error={field.state.meta.errors.at(0)?.message}
							icon={<Lock />}
							id={field.name}
							label="Create Password"
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Create Password"
							type="password"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<BloomPrimaryButton
							disabled={!canSubmit || isSubmitting}
							type="submit"
						>
							{isSubmitting ? "Submitting..." : "Create Account"}
							<ChevronRight data-icon="inline-end" />
						</BloomPrimaryButton>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<button
					className="font-semibold text-[#006c4d] text-[12px] leading-4 underline-offset-4 hover:underline"
					onClick={onSwitchToSignIn}
					type="button"
				>
					Already have an account? Sign In
				</button>
			</div>
		</BloomAuthPanel>
	);
}
