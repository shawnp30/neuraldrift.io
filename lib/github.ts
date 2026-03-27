import { Octokit } from "octokit";

const octokit = new Octokit({
  // Use a GitHub Personal Access Token if needed for private repos or higher rate limits.
  // For public repos, this can be empty for up to 60 requests per hour.
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
}

export interface WorkflowNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: WorkflowNode[];
  downloadUrl?: string;
}

const REPO_OWNER = "shawnp30";
const REPO_NAME = "neuraldrift.io";

import * as fs from "fs";
import * as pathUtils from "path";

/**
 * Gets local files from public/workflows and merges with GitHub tree.
 * This is useful for local development and to see new folders/files immediately.
 */
async function getLocalWorkflowTree(
  basePath = "public/workflows"
): Promise<WorkflowNode[]> {
  try {
    const fullPath = pathUtils.join(process.cwd(), basePath);
    if (!fs.existsSync(fullPath)) return [];

    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    const nodes: WorkflowNode[] = items.map((item) => {
      const nodePath = pathUtils.join(basePath, item.name).replace(/\\/g, "/");
      const node: WorkflowNode = {
        name: item.name,
        path: nodePath,
        type: item.isDirectory() ? "dir" : "file",
      };

      if (item.isDirectory()) {
        // Recursive sync handled by merging logic later
      } else if (item.name.endsWith(".json")) {
        node.downloadUrl = `/${nodePath.replace(/^public\//, "")}`;
      }

      return node;
    });

    return nodes.filter((n) => n.type === "dir" || n.name.endsWith(".json"));
  } catch (err) {
    console.error("Local Workflows Sync Error:", err);
    return [];
  }
}

/**
 * Recursively fetches the file structure of the workflows directory.
 * Merges local filesystem discovery with GitHub API discovery.
 */
export async function getWorkflowTree(
  targetPath = "public/workflows"
): Promise<WorkflowNode[]> {
  const localItems = await getLocalWorkflowTree(targetPath);
  let githubItems: WorkflowNode[] = [];

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: targetPath,
    });

    if (Array.isArray(data)) {
      githubItems = data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type as "file" | "dir",
        downloadUrl: item.download_url,
      }));
    }
  } catch (error) {
    console.warn(
      `GitHub fetch failed for ${targetPath}, falling back to local only.`
    );
  }

  // Merge logic: Combine local and github by name
  const combinedMap = new Map<string, WorkflowNode>();

  // Use GitHub as baseline (with real download URLs)
  githubItems.forEach((item) => combinedMap.set(item.name, item));

  // Overwrite or Add local items (especially for new folders)
  localItems.forEach((item) => {
    if (!combinedMap.has(item.name)) {
      combinedMap.set(item.name, item);
    } else {
      // If github has it, just make sure we prioritize those download URLs unless it's missing
      const existing = combinedMap.get(item.name)!;
      if (!existing.downloadUrl && item.downloadUrl) {
        existing.downloadUrl = item.downloadUrl;
      }
    }
  });

  const nodes = Array.from(combinedMap.values());

  // Recursively build children
  for (const node of nodes) {
    if (node.type === "dir") {
      node.children = await getWorkflowTree(node.path);
    }
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Fetches the raw content of a specific workflow file.
 */
export async function getWorkflowFile(path: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: path,
      headers: {
        accept: "application/vnd.github.v3.raw",
      },
    });

    return typeof data === "string" ? data : JSON.stringify(data);
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    return null;
  }
}
