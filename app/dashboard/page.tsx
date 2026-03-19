import { StatsRow } from "@/components/dashboard/StatsRow";
import { JobQueue } from "@/components/dashboard/JobQueue";
import { GPUMonitor } from "@/components/dashboard/GPUMonitor";
import { ModelList } from "@/components/dashboard/ModelList";
import { ActivityLog } from "@/components/dashboard/ActivityLog";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <StatsRow />
      <div className="grid grid-cols-[1fr_320px] gap-4">
        <JobQueue />
        <GPUMonitor />
      </div>
      <div className="grid grid-cols-[1fr_320px] gap-4">
        <ModelList />
        <ActivityLog />
      </div>
    </div>
  );
}
