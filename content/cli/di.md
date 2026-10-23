# vibejs di

Show the modules and providers of the backend, without constructing any provider.

```sh
vibejs di [--module NAME] [--token NAME]
```

## Options

| Option     | Type   | Description                                    |
| ---------- | ------ | ---------------------------------------------- |
| `--module` | string | Only the module NAME, wherever it is imported. |
| `--token`  | string | Only the modules that provide or export NAME.  |

## Examples

```sh
vibejs di
vibejs di --token TodosService
```
