import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Quiet Hours Scheduler</h1>
        <p className="text-muted-foreground">Plan distraction-free time blocks with reminders.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
