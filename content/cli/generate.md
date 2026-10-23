# vibejs generate

Add a resource, a component or a page with its tests, and register it.

```sh
vibejs generate <resource|component|page> <name> [--dry-run] [--force] [--singular <word>]
```

Aliases: `g`.

## Options

| Option       | Type    | Description                                                              |
| ------------ | ------- | ------------------------------------------------------------------------ |
| `--dry-run`  | boolean | Write nothing; list every change with its content.                       |
| `--force`    | boolean | Overwrite files that differ; in agent mode it needs VIBEJS_USER_CONSENT. |
| `--singular` | string  | The singular of a resource name, such as `person` for `people`.          |

## Arguments

| Name   | Required | Values                    |
| ------ | -------- | ------------------------- |
| `kind` | yes      | resource, component, page |
| `name` | yes      |                           |

## Examples

```sh
vibejs generate resource users --dry-run
vibejs g resource people --singular person --dry-run
vibejs g component UserCard --dry-run
vibejs g page Users --dry-run
```
