import { spawn } from "node:child_process";
import { resolve } from "node:path";

const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1",
  CI: process.env.CI ?? "1",
};

const nextBin = resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
