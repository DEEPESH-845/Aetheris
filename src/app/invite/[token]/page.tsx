import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { acceptInvitation } from "@/server/invitations";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const FAILURE: Record<"invalid" | "expired" | "email_mismatch", { title: string; body: string }> = {
  invalid: { title: "This invite link is not valid", body: "Check the link you were sent, or ask an admin to invite you again." },
  expired: { title: "This invite has expired", body: "Invites last seven days. Ask an admin to send a fresh one." },
  email_mismatch: {
    title: "This invite is for a different email",
    body: "Sign in with the address the invite was sent to, or ask an admin to re-invite the address you are using.",
  },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: `/invite/${token}` });

  const result = await acceptInvitation(token, userId);
  const copy = result.ok
    ? {
        title: result.alreadyMember ? `You are already in ${result.orgName}` : `You joined ${result.orgName}`,
        body: "Open the dashboard to get started.",
      }
    : FAILURE[result.reason];

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-panel border bg-surface-2 p-6">
        <h1 className="text-lg font-medium text-ink">{copy.title}</h1>
        <p className="text-sm text-ink-muted">{copy.body}</p>
        <Link href={result.ok ? "/dashboard" : "/"} className={buttonVariants({ className: "self-start" })}>
          {result.ok ? "Open dashboard" : "Back to home"}
        </Link>
      </div>
    </main>
  );
}
