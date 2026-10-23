```ts
export const todos = defineContract('/todos', {
  list: get('/', { response: v.array(Todo) }),
  create: post('/', {
    body: v.object({ title: v.string() }),
    response: Todo,
  }),
  remove: del('/:id', {
    errors: { TODO_NOT_FOUND: 404 },
  }),
});
```
