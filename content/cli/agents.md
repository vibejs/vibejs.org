# vibejs agents

Write the vibe.js rules into AGENTS.md and CLAUDE.md, the vibejs-* skills into .agents/skills and .claude/skills, and the vibejs server into .mcp.json.

```sh
vibejs agents sync [--check]
```

## Options

| Option    | Type    | Description                                     |
| --------- | ------- | ----------------------------------------------- |
| `--check` | boolean | Write nothing; fail when a file is out of date. |

## Arguments

| Name     | Required | Values |
| -------- | -------- | ------ |
| `action` | yes      | sync   |

## Examples

```sh
vibejs agents sync
vibejs agents sync --check
```
