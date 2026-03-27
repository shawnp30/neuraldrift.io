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

/**
 * Recursively fetches the file structure of the workflows directory.
 */
export async function getWorkflowTree(path = "public/workflows"): Promise<WorkflowNode[]> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: path,
    });

    if (!Array.isArray(data)) return [];

    const nodes: WorkflowNode[] = await Promise.all(
      data.map(async (item: any) => {
        const node: WorkflowNode = {
          name: item.name,
          path: item.path,
          type: item.type as "file" | "dir",
        };

        if (item.type === "dir") {
          node.children = await getWorkflowTree(item.path);
        } else if (item.type === "file" && item.name.endsWith(".json")) {
          node.downloadUrl = item.download_url;
        }

        return node;
      })
    );

    // Filter out non-matching files and empty directories (optional)
    return nodes.filter(node => 
      node.type === "dir" || 
      (node.type === "file" && node.name.endsWith(".json"))
    );
  } catch (error) {
    console.error("Error fetching GitHub content:", error);
    return [];
  }
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
