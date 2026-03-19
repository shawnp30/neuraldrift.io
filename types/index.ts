export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type JobStatus = "queued" | "running" | "complete" | "error";
export type Plan = "free" | "pro" | "team";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  readTime: string;
  tag: string;
  publishedAt: string;
}

export interface LoRA {
  id: string;
  slug: string;
  name: string;
  description: string;
  baseModel: string;
  rank: number;
  type: "character" | "style" | "concept" | "video";
  downloadUrl: string;
  sizeBytes: number;
  createdAt: string;
  userId: string;
}

export interface Job {
  id: string;
  name: string;
  type: "training" | "inference" | "captioning" | "export";
  status: JobStatus;
  progress: number;
  gpu?: string;
  createdAt: string;
  userId: string;
}

export interface GPUMetric {
  name: string;
  utilization: number;
  vramUsedGB: number;
  vramTotalGB: number;
  temperatureC: number;
}
