# vibejs check

Type-check, lint, format-check and test the project with coverage, concurrently.

```sh
vibejs check [--only types,lint,format,test] [--fix] [--max N]
```

## Options

| Option   | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| `--only` | string  | Run only these steps: types, lint, format, test. |
| `--fix`  | boolean | Apply lint fixes and format the files first.     |
| `--max`  | string  | Show at most N diagnostics (default 20).         |

## Examples

```sh
vibejs check
vibejs check --only types,lint
vibejs check --fix --max 50
```
