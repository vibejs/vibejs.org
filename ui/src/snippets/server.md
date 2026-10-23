```ts
@Controller(todos)
export class TodosController {
  private readonly todos = inject(TodosService);

  @Handle(todos.list)
  list(): Todo[] {
    return this.todos.list();
  }

  @Handle(todos.remove)
  remove(ctx: Ctx<typeof todos.remove>): void {
    if (!this.todos.remove(ctx.params.id)) {
      ctx.fail('TODO_NOT_FOUND');
    }
  }
}
```
