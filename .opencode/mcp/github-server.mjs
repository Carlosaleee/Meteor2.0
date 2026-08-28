import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Octokit } from "@octokit/rest";

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error("GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const octokit = new Octokit({ auth: githubToken });

const server = new Server(
  {
    name: "github-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler({ method: "tools/list" }, async () => ({
  tools: [
    {
      name: "list_prs",
      description: "List pull requests for a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          state: { type: "string", enum: ["open", "closed", "all"] },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "create_pr",
      description: "Create a new pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          title: { type: "string" },
          head: { type: "string" },
          base: { type: "string" },
          body: { type: "string" },
        },
        required: ["owner", "repo", "title", "head", "base"],
      },
    },
    {
      name: "get_pr",
      description: "Get details of a specific pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          pull_number: { type: "number" },
        },
        required: ["owner", "repo", "pull_number"],
      },
    },
  ],
}));

server.setRequestHandler(
  { method: "tools/call" },
  async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "list_prs") {
        const { owner, repo, state = "open" } = args;
        const { data } = await octokit.pulls.list({ owner, repo, state });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      if (name === "create_pr") {
        const { owner, repo, title, head, base, body = "" } = args;
        const { data } = await octokit.pulls.create({
          owner,
          repo,
          title,
          head,
          base,
          body,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      if (name === "get_pr") {
        const { owner, repo, pull_number } = args;
        const { data } = await octokit.pulls.get({ owner, repo, pull_number });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
