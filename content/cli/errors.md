# vibejs errors

List the unresolved build errors and the latest runtime errors from .vibejs/dev.log.

```sh
vibejs errors [--limit N]
```

## Options

| Option    | Type   | Description                                 |
| --------- | ------ | ------------------------------------------- |
| `--limit` | string | Show at most N runtime errors (default 20). |

## Examples

```sh
vibejs errors
vibejs errors --limit 5
```
