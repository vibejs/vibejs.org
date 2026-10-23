# vibejs logs

Show the newest .vibejs/dev.log entries, filtered by level, source, text and time.

```sh
vibejs logs [--limit N] [--level error|warn|info|debug] [--source vite|browser|server|vibejs] [--grep TEXT] [--since ISO|<n>s|<n>m|<n>h]
```

## Options

| Option     | Type   | Description                                                      |
| ---------- | ------ | ---------------------------------------------------------------- |
| `--limit`  | string | Show at most N entries (default 50).                             |
| `--level`  | string | The lowest level shown: error, warn, info or debug.              |
| `--source` | string | Only this source: vite, browser, server or vibejs.               |
| `--grep`   | string | Only messages that contain TEXT, ignoring case.                  |
| `--since`  | string | Only entries since an ISO time or &lt;n>s, &lt;n>m, &lt;n>h ago. |

## Examples

```sh
vibejs logs --level warn
vibejs logs --source server --since 5m
```
