import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/dashboard",
  "Dashboard — NeuralDrift",
  "Monitor jobs, models, and activity for your NeuralDrift workspace."
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-7">{children}</main>
      </div>
    </div>
  );
}
