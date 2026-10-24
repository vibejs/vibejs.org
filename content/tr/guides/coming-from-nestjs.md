# NestJS'ten geliyorsan

Modüller, provider'lar, controller'lar, guard'lar, interceptor'lar, filter'lar ve yaşam döngüsü hook'ları beklediğin gibi çalışır. Üç şey farklı; aşağıdaki tablonun çoğu da bunlardan çıkıyor:

- **Yansıtılan tip yok.** vibe.js `emitDecoratorMetadata` ya da `reflect-metadata` kullanmaz. Bağımlılıklar `inject(Token)` ile ilklendirilen alanlardır. Bu yüzden hangi derleyiciyi kullanırsan kullan açıkça görünürler.
- **Rota dekoratörleri yerine sözleşmeler (contract).** Rotaları, girdileri, yanıtları ve hataları `defineContract` ile bir kez tanımlarsın. Sunucu onları `@Handle(route)` ile karşılar. UI ise `createClient` ile çağırır; tamamen tipli ve kod üretmeden.
- **Parametre dekoratörleri yerine tek bir tipli `ctx`.** Handler `ctx: Ctx<typeof contract.route>` alır. Doğrulanmış params, query, header'lar ve body bunun içindedir.

## Kalıplar {#idioms}

| NestJS                                                                           | vibe.js                                                                                   | Eski yazımı ne yakalar                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| provider üzerinde `@Injectable()`                                                | `providers` içinde listelenen düz bir sınıf                                               | `@Injectable` export edilmiyor, derleme hatası; bkz. [Provider'lar](https://vibejs.org/v0/server/modules#providers)                                                                                                                                 |
| Constructor injection: `constructor(private db: Db)`                             | `private readonly db = inject(Db)`                                                        | açılışta [VIBE9104](https://vibejs.org/v0/errors/VIBE9104)                                                                                                                                                                                          |
| string ya da symbol token ile `@Inject(TOKEN)`                                   | `token<T>('Name')` ve `inject(Token)`                                                     | `Inject` export edilmiyor, derleme hatası; bkz. [Bağımlılık inject etmek](https://vibejs.org/v0/server/modules#injecting-dependencies). Kimsenin sağlamadığı bir token da [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) ile patlar              |
| `@Global()`                                                                      | `@Module({ global: true })`                                                               | `Global` export edilmiyor, derleme hatası; bkz. [Modüller](https://vibejs.org/v0/server/modules#modules). Eksik bir `global: true` da [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) olarak ortaya çıkar                                         |
| metotlarda `@Get()`, `@Post(':id')`                                              | `defineContract` içinde bir rota; onu `@Handle(contract.route)` karşılar                  | handler'ı olmayan bir rota için [VIBE9303](https://vibejs.org/v0/errors/VIBE9303)                                                                                                                                                                   |
| `@Controller('users')`                                                           | `@Controller(contract)`; yol öneki sözleşmenin parçası                                    | `@Controller` sözleşme alır, string verirsen derleme hatası; bkz. [Rotalar](https://vibejs.org/v0/server/contracts#routes)                                                                                                                          |
| `@Body()`, `@Param()`, `@Query()`, `@Headers()`, `@Req()`                        | `ctx.body`, `ctx.params`, `ctx.query`, `ctx.headers`, `ctx.req`                           | imza rotayla uyuşmuyorsa [@Handle üzerinde TS1241](https://vibejs.org/v0/server/handlers#ts1241-on-handle)                                                                                                                                          |
| `ValidationPipe`, DTO sınıfları, `ParseIntPipe`                                  | sözleşmede Standard Schema şemaları: `body`, `query`, `params`                            | `ValidationPipe` ve `ParseIntPipe` export edilmiyor, derleme hatası; bkz. [Doğrulama](https://vibejs.org/v0/server/handlers#validation)                                                                                                             |
| `NotFoundException` ve diğer exception sınıfları                                 | sözleşmede `errors: { CODE: 404 }` ile `ctx.fail('CODE', detail?)` ya da `HttpError`      | rotanın tanımlamadığı bir kod için [VIBE9502](https://vibejs.org/v0/errors/VIBE9502)                                                                                                                                                                |
| `NestFactory.create(AppModule)`                                                  | `VibeFactory.create(AppModule, appOptions)`, ardından `listen()`                          | `NestFactory` export edilmiyor, derleme hatası; bkz. [Uygulamayı oluşturmak](https://vibejs.org/v0/server/#creating-the-application)                                                                                                                |
| `app.useGlobalGuards()`, `app.useGlobalInterceptors()`, `app.useGlobalFilters()` | `AppOptions` içinde `guards`, `interceptors` ve `filters`                                 | `App` üzerinde `useGlobal*` metotları yok, derleme hatası; bkz. [Global enhancer'lar](https://vibejs.org/v0/server/pipeline#global-enhancers)                                                                                                       |
| `app.use()` ve Express middleware'i                                              | `Middleware`: Fetch `Request` ve `Response` üzerinde `(req, next) => Promise<Response>`   | `app.use()` yok, derleme hatası; bkz. [Middleware](https://vibejs.org/v0/server/pipeline#middleware)                                                                                                                                                |
| `@SetMetadata()` ve `Reflector`                                                  | `createMetadata<T>(name)` ve `ctx.getMetadata(key)`                                       | `SetMetadata` ve `Reflector` export edilmiyor, derleme hatası; bkz. [Metadata](https://vibejs.org/v0/server/pipeline#metadata)                                                                                                                      |
| `@nestjs/testing`                                                                | `@usevibejs/server/testing` içinden `overrideProvider()` ile `Test.createTestingModule()` | `@nestjs/testing` bağımlılık değil, çözülemeyen import; bkz. [Sunucuyu test etmek](https://vibejs.org/v0/server/testing)                                                                                                                            |
| `app.getHttpServer()`'a karşı Supertest                                          | `createClient(contracts, { baseUrl: '/api', fetch: app.fetch })`                          | `app.getHttpServer()` yok, derleme hatası; bkz. [Test](https://vibejs.org/v0/server/testing)                                                                                                                                                        |
| `@nestjs/swagger` dekoratörleri                                                  | `@usevibejs/server/openapi` içinden `generateOpenApi(contracts, options)`                 | paket bağımlılık değil, derleme hatası; bkz. [OpenAPI](https://vibejs.org/v0/server/contracts#openapi)                                                                                                                                              |
| `@nestjs/config` ve `ConfigService.get()`                                        | `defineConfig(schema)`: provide ve inject edeceğin tipli bir config sınıfı                | `@nestjs/config` bağımlılık değil, çözülemeyen import; bkz. [Ortam yapılandırması](https://vibejs.org/v0/server/configuration#environment-config). Eksik ya da geçersiz değişkenler de [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) ile patlar |
| `reflect-metadata` ve `emitDecoratorMetadata`                                    | ikisi de yok; yalnızca `experimentalDecorators: true`                                     | hiçbir şey: sunucu üretilen metadata'yı hiç okumaz, yani boşuna yük olur; bkz. [TypeScript kurulumu](https://vibejs.org/v0/server/configuration#typescript-setup)                                                                                   |
| döngüsel provider'lar için `forwardRef()`                                        | ortak kısmı, ikisinin de `inject()` ettiği üçüncü bir provider'a taşı                     | provider döngüsü için [VIBE9103](https://vibejs.org/v0/errors/VIBE9103)                                                                                                                                                                             |
| `forRoot()` dinamik modülleri                                                    | aynısı: `DynamicModule` döndüren statik bir metot                                         | modül sınıfında `@Module()` yoksa [VIBE9201](https://vibejs.org/v0/errors/VIBE9201)                                                                                                                                                                 |

## Yan yana bir controller {#a-controller-side-by-side}

NestJS'teki şu controller

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

burada bir sözleşmeye ve bir controller'a dönüşür:

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

UI aynı rotayı `api.todos.findOne({ params: { id } })` ile çağırır ve sonucu 404 durumlu `TODO_NOT_FOUND`'a göre daraltır.

## vibe.js v0.1'de olmayanlar {#not-in-vibejs-v01}

- İstek kapsamlı (request-scoped) ve transient provider'lar: her provider singleton. İsteğe özel değerleri `ctx.state` üzerine koy.
- Parametre dekoratörleri ve özel pipe'lar: handler'ın tek bir `ctx`'i var, girdileri şemalar dönüştürür.
- NestJS'in mikroservisleri, WebSocket'leri, GraphQL'i ve CLI schematic'leri.
