# vibejs dev

Serve the UI and the backend on one port, restarting the backend on server changes.

```sh
vibejs dev [--port N]
```

## Options

| Option   | Type   | Description                                                  |
| -------- | ------ | ------------------------------------------------------------ |
| `--port` | string | Listen on exactly this port (default: a free one from 5173). |

## Examples

```sh
vibejs dev
vibejs dev --port 5173
```
