# CLI reference

Run `vibejs <command> --help --json` for the same reference as JSON.

| Command                                                     | Summary                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`vibejs explain`](https://vibejs.org/v0/cli/explain)       | Explain a VIBE error code from the bundled catalog, offline.                                                                                            |
| [`vibejs docs`](https://vibejs.org/v0/cli/docs)             | Look up a VIBE code, open a docs page by path, or search the bundled docs, offline.                                                                     |
| [`vibejs check`](https://vibejs.org/v0/cli/check)           | Type-check, lint, format-check and test the project with coverage, concurrently.                                                                        |
| [`vibejs dev`](https://vibejs.org/v0/cli/dev)               | Serve the UI and the backend on one port, restarting the backend on server changes.                                                                     |
| [`vibejs build`](https://vibejs.org/v0/cli/build)           | Build the UI into ui/dist and the server into server/dist/main.js.                                                                                      |
| [`vibejs errors`](https://vibejs.org/v0/cli/errors)         | List the unresolved build errors and the latest runtime errors from .vibejs/dev.log.                                                                    |
| [`vibejs logs`](https://vibejs.org/v0/cli/logs)             | Show the newest .vibejs/dev.log entries, filtered by level, source, text and time.                                                                      |
| [`vibejs agents`](https://vibejs.org/v0/cli/agents)         | Write the vibe.js rules into AGENTS.md and CLAUDE.md, the vibejs-* skills into .agents/skills and .claude/skills, and the vibejs server into .mcp.json. |
| [`vibejs routes`](https://vibejs.org/v0/cli/routes)         | List the API routes and the UI routes, without starting a server or running UI code.                                                                    |
| [`vibejs di`](https://vibejs.org/v0/cli/di)                 | Show the modules and providers of the backend, without constructing any provider.                                                                       |
| [`vibejs components`](https://vibejs.org/v0/cli/components) | List the .vibe components with their props, models and types, without running them.                                                                     |
| [`vibejs request`](https://vibejs.org/v0/cli/request)       | Call an API route: through the running dev server, or in process when none runs.                                                                        |
| [`vibejs generate`](https://vibejs.org/v0/cli/generate)     | Add a resource, a component or a page with its tests, and register it.                                                                                  |
| [`vibejs mcp`](https://vibejs.org/v0/cli/mcp)               | Serve the --json commands to coding agents as MCP tools over stdio.                                                                                     |

## Global options

| Option         | Type    | Description                                          |
| -------------- | ------- | ---------------------------------------------------- |
| `--json`       | boolean | Print one JSON object (on by default in agent mode). |
| `--help`, `-h` | boolean | Describe the commands and their options.             |
| `--version`    | boolean | Print the vibejs version.                            |
