import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Landing Page" },
      { name: "description", content: "An empty landing page ready to be customized." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Your Landing Page
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Bắt đầu xây dựng nội dung của bạn tại đây.
        </p>
      </div>
    </main>
  );
}
