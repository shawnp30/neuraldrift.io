// app/optimizer/result/page.tsx
import { Suspense } from "react";
import ResultClient from "./ResultClient";

export const metadata = {
  title: "Your Personalized AI Workflow | neuraldrift",
  description:
    "Workflows matched and scored for your exact GPU VRAM and creative goal.",
};

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-transparent">
          <div className="animate-pulse text-sm text-zinc-500">
            Matching workflows to your hardware…
          </div>
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
