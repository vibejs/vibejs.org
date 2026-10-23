# vibejs mcp

Serve the --json commands to coding agents as MCP tools over stdio.

```sh
vibejs mcp [--read-only]
```

## Options

| Option        | Type    | Description                                                         |
| ------------- | ------- | ------------------------------------------------------------------- |
| `--read-only` | boolean | Allow only GET, HEAD and OPTIONS requests through the request tool. |

## Examples

```sh
vibejs mcp
vibejs mcp --read-only
```
