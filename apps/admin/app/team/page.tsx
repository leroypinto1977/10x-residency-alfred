import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listUsers } from "@founder10x/db";
import { requireOwner } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "../ui";

export const dynamic = "force-dynamic";

/**
 * Who can sign in. Read-only on purpose.
 *
 * Accounts are created and changed from the CLI (`npm run admin:users`),
 * which means adding a colleague requires shell access to this repo rather
 * than a session in the panel. A stolen owner session can then read the board
 * but cannot mint itself a second way back in. Handing out a password through
 * a web page would also land it in a browser history, a screenshot or a
 * scroll-back somewhere, and there is no version of that which is better than
 * reading it off a terminal.
 */
export default async function TeamPage() {
  await requireOwner();

  const team = await listUsers();
  const active = team.filter((t) => t.active).length;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-3.5">
          <Button asChild variant="ghost" size="sm" className="tap -ml-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Leads
            </Link>
          </Button>
          <h1 className="text-base font-semibold tracking-tight">Team</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-muted-foreground">
          {active} active {active === 1 ? "account" : "accounts"}.
        </p>

        <ul className="mt-5 space-y-2">
          {team.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {t.name}
                  <span className="ml-2 font-normal text-muted-foreground">@{t.username}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.lastLoginAt ? `Last signed in ${formatDate(t.lastLoginAt)}` : "Never signed in"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {t.role === "owner" && <Badge variant="secondary">Owner</Badge>}
                {t.role === "viewer" && <Badge variant="outline">Read only</Badge>}
                {!t.active && <Badge variant="outline">Disabled</Badge>}
              </div>
            </li>
          ))}
        </ul>

        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Adding someone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Run this from the repo, and give them what it prints:</p>
            <pre className="overflow-x-auto rounded-lg border bg-background p-3 text-xs text-foreground">
              npm run admin:users -- add priya &quot;Priya Nair&quot;
            </pre>
            <p>
              <code className="text-foreground">list</code>,{" "}
              <code className="text-foreground">passwd</code>,{" "}
              <code className="text-foreground">role</code>,{" "}
              <code className="text-foreground">disable</code> and{" "}
              <code className="text-foreground">enable</code> take the same shape.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
