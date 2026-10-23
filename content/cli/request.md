# vibejs request

Call an API route: through the running dev server, or in process when none runs.

```sh
vibejs request <METHOD> <path> [--data JSON|@file] [-H 'Name: value']...
```

## Options

| Option           | Type   | Description                                  |
| ---------------- | ------ | -------------------------------------------- |
| `--data`         | string | The JSON body, inline or as @file.           |
| `--header`, `-H` | string | A request header, 'Name: value'; repeatable. |

## Arguments

| Name     | Required | Values                                       |
| -------- | -------- | -------------------------------------------- |
| `METHOD` | yes      | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS |
| `path`   | yes      |                                              |

## Examples

```sh
vibejs request GET /api/todos
vibejs request POST /api/todos --data '{"title":"Write docs"}'
```
