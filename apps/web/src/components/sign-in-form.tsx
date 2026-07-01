import {
	BloomAuthField,
	BloomAuthPanel,
	BloomPrimaryButton,
} from "@betterHub/ui/components/daily-bloom";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/todos",
						});
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
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
			subtitle="Your mindful day starts here."
			title="Welcome Back"
		>
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
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
							placeholder="name@example.com"
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
							label="Password"
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="••••••••"
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
							{isSubmitting ? "Submitting..." : "Sign In"}
						</BloomPrimaryButton>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<button
					className="font-semibold text-[#006c4d] text-[12px] leading-4 underline-offset-4 hover:underline"
					onClick={onSwitchToSignUp}
					type="button"
				>
					Need an account? Sign Up
				</button>
			</div>
		</BloomAuthPanel>
	);
}
