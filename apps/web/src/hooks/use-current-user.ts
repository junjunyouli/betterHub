import { authClient } from "@/lib/auth-client";

type Session = NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
type CurrentUser = Session["user"];

/** 读取当前登录用户信息，供页面/组件展示用户名、邮箱等；未登录或加载中时 user 为 null。 */
export function useCurrentUser(): {
	user: CurrentUser | null;
	isPending: boolean;
} {
	const { data: session, isPending } = authClient.useSession();

	return {
		isPending,
		user: session?.user ?? null,
	};
}
