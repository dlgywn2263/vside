// app/devlog/[solutionId]/page.tsx
import { DevlogSolutionView } from "@/components/devlog/devlogSolutionView";

export default async function DevlogSolutionPage({
  params,
}: {
  params: Promise<{ solutionId: string }>;
}) {
  const { solutionId } = await params;

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <DevlogSolutionView solutionId={solutionId} />
      </div>
    </main>
  );
}
