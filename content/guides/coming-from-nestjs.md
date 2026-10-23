# Coming from NestJS

Modules, providers, controllers, guards, interceptors, filters and lifecycle hooks work the way you expect. Three things differ, and most of the table below follows from them:

- **No reflected types.** vibe.js does not use `emitDecoratorMetadata` or `reflect-metadata`. Dependencies are fields initialized with `inject(Token)`, so they are explicit under every compiler.
- **Contracts instead of route decorators.** Routes, inputs, responses and errors are declared once with `defineContract`. The server handles them with `@Handle(route)`; the UI calls them with `createClient`, fully typed and without code generation.
- **One typed `ctx` instead of parameter decorators.** A handler takes `ctx: Ctx<typeof contract.route>`, which holds the validated params, query, headers and body.

## Idioms

| NestJS                                                                           | vibe.js                                                                                  | What catches the old form                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@Injectable()` on a provider                                                    | A plain class listed in `providers`                                                      | `@Injectable` is not exported, a compile error; see [Providers](https://vibejs.org/v0/server/modules#providers)                                                                                                                                    |
| Constructor injection: `constructor(private db: Db)`                             | `private readonly db = inject(Db)`                                                       | [VIBE9104](https://vibejs.org/v0/errors/VIBE9104) at startup                                                                                                                                                                                       |
| `@Inject(TOKEN)` with a string or symbol token                                   | `token<T>('Name')` and `inject(Token)`                                                   | `Inject` is not exported, a compile error; see [Injecting dependencies](https://vibejs.org/v0/server/modules#injecting-dependencies). A token nobody provides then fails with [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                    |
| `@Global()`                                                                      | `@Module({ global: true })`                                                              | `Global` is not exported, a compile error; see [Modules](https://vibejs.org/v0/server/modules#modules). A missing `global: true` then surfaces as [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                                                |
| `@Get()`, `@Post(':id')` on methods                                              | A route in `defineContract`, served by `@Handle(contract.route)`                         | [VIBE9303](https://vibejs.org/v0/errors/VIBE9303) for a route without a handler                                                                                                                                                                    |
| `@Controller('users')`                                                           | `@Controller(contract)`; the path prefix is part of the contract                         | `@Controller` takes a contract, so a string is a compile error; see [Routes](https://vibejs.org/v0/server/contracts#routes)                                                                                                                        |
| `@Body()`, `@Param()`, `@Query()`, `@Headers()`, `@Req()`                        | `ctx.body`, `ctx.params`, `ctx.query`, `ctx.headers`, `ctx.req`                          | [TS1241 on @Handle](https://vibejs.org/v0/server/handlers#ts1241-on-handle) for a signature that does not match the route                                                                                                                          |
| `ValidationPipe`, DTO classes, `ParseIntPipe`                                    | Standard Schema schemas in the contract: `body`, `query`, `params`                       | `ValidationPipe` and `ParseIntPipe` are not exported, a compile error; see [Validation](https://vibejs.org/v0/server/handlers#validation)                                                                                                          |
| `NotFoundException` and other exception classes                                  | `ctx.fail('CODE', detail?)` with `errors: { CODE: 404 }` in the contract, or `HttpError` | [VIBE9502](https://vibejs.org/v0/errors/VIBE9502) for a code that the route does not declare                                                                                                                                                       |
| `NestFactory.create(AppModule)`                                                  | `VibeFactory.create(AppModule, appOptions)`, then `listen()`                             | `NestFactory` is not exported, a compile error; see [Creating the application](https://vibejs.org/v0/server/#creating-the-application)                                                                                                             |
| `app.useGlobalGuards()`, `app.useGlobalInterceptors()`, `app.useGlobalFilters()` | `guards`, `interceptors` and `filters` in `AppOptions`                                   | `App` has no `useGlobal*` methods, a compile error; see [Global enhancers](https://vibejs.org/v0/server/pipeline#global-enhancers)                                                                                                                 |
| `app.use()` and Express middleware                                               | `Middleware`: `(req, next) => Promise<Response>` on Fetch `Request` and `Response`       | `app.use()` does not exist, a compile error; see [Middleware](https://vibejs.org/v0/server/pipeline#middleware)                                                                                                                                    |
| `@SetMetadata()` and `Reflector`                                                 | `createMetadata<T>(name)` and `ctx.getMetadata(key)`                                     | `SetMetadata` and `Reflector` are not exported, a compile error; see [Metadata](https://vibejs.org/v0/server/pipeline#metadata)                                                                                                                    |
| `@nestjs/testing`                                                                | `Test.createTestingModule()` from `@usevibejs/server/testing`, with `overrideProvider()` | `@nestjs/testing` is not a dependency, an unresolved import; see [Testing the server](https://vibejs.org/v0/server/testing)                                                                                                                        |
| Supertest against `app.getHttpServer()`                                          | `createClient(contracts, { baseUrl: '/api', fetch: app.fetch })`                         | `app.getHttpServer()` does not exist, a compile error; see [Testing](https://vibejs.org/v0/server/testing)                                                                                                                                         |
| `@nestjs/swagger` decorators                                                     | `generateOpenApi(contracts, options)` from `@usevibejs/server/openapi`                   | The package is not a dependency, a compile error; see [OpenAPI](https://vibejs.org/v0/server/contracts#openapi)                                                                                                                                    |
| `@nestjs/config` and `ConfigService.get()`                                       | `defineConfig(schema)`, a typed config class to provide and inject                       | `@nestjs/config` is not a dependency, an unresolved import; see [Environment config](https://vibejs.org/v0/server/configuration#environment-config). Missing or invalid variables then fail with [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) |
| `reflect-metadata` and `emitDecoratorMetadata`                                   | Neither; only `experimentalDecorators: true`                                             | Nothing: the server never reads the emitted metadata, so it is dead weight; see [TypeScript setup](https://vibejs.org/v0/server/configuration#typescript-setup)                                                                                    |
| `forwardRef()` for circular providers                                            | Move the shared part into a third provider that both `inject()`                          | [VIBE9103](https://vibejs.org/v0/errors/VIBE9103) for a provider cycle                                                                                                                                                                             |
| `forRoot()` dynamic modules                                                      | The same: a static method that returns a `DynamicModule`                                 | [VIBE9201](https://vibejs.org/v0/errors/VIBE9201) when the module class lacks `@Module()`                                                                                                                                                          |

## A controller, side by side

The NestJS controller

```text
@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    const todo = this.todos.find(id);
    if (!todo) throw new NotFoundException();
    return todo;
  }
}
```

becomes a contract and a controller:

```ts
export const todos = defineContract('/todos', {
  findOne: get('/:id', { response: Todo, errors: { TODO_NOT_FOUND: 404 } }),
});

@Controller(todos)
export class TodosController {
  private readonly todos = inject(TodosService);

  @Handle(todos.findOne)
  findOne(ctx: Ctx<typeof todos.findOne>): v.InferOutput<typeof Todo> {
    return this.todos.find(ctx.params.id) ?? ctx.fail('TODO_NOT_FOUND');
  }
}
```

The UI calls the same route with `api.todos.findOne({ params: { id } })` and narrows the result to `TODO_NOT_FOUND` with status 404.

## Not in vibe.js v0.1

- Request-scoped and transient providers: every provider is a singleton. Per-request values go on `ctx.state`.
- Parameter decorators and custom pipes: a handler has one `ctx`, and schemas transform inputs.
- Microservices, WebSockets, GraphQL and the CLI schematics of NestJS.
