# NestJS'ten geliyorsanız

Modüller, provider'lar, controller'lar, guard'lar, interceptor'lar, filter'lar ve yaşam döngüsü hook'ları beklediğiniz gibi çalışır. Üç şey farklıdır ve aşağıdaki tablonun çoğu bunlardan kaynaklanır:

- **Yansıtılmış (reflected) tipler yok.** vibe.js `emitDecoratorMetadata` veya `reflect-metadata` kullanmaz. Bağımlılıklar `inject(Token)` ile başlatılan alanlardır; bu yüzden her derleyicide açıktırlar.
- **Rota decorator'ları yerine contract'lar.** Rotalar, girdiler, yanıtlar ve hatalar `defineContract` ile bir kez tanımlanır. Sunucu bunları `@Handle(route)` ile karşılar; UI ise `createClient` ile, tamamen tipli ve kod üretimi olmadan çağırır.
- **Parametre decorator'ları yerine tipli tek bir `ctx`.** Bir handler, doğrulanmış parametreleri, query'yi, header'ları ve gövdeyi tutan `ctx: Ctx<typeof contract.route>` alır.

## Deyimler {#idioms}

| NestJS                                                                           | vibe.js                                                                                      | Eski biçimi ne yakalar                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bir provider üzerinde `@Injectable()`                                            | `providers` içinde listelenen düz bir sınıf                                                  | `@Injectable` export edilmez, derleme hatası; bkz. [Provider'lar](https://vibejs.org/v0/server/modules#providers)                                                                                                                                                  |
| Constructor injection: `constructor(private db: Db)`                             | `private readonly db = inject(Db)`                                                           | Başlangıçta [VIBE9104](https://vibejs.org/v0/errors/VIBE9104)                                                                                                                                                                                                      |
| String veya symbol token ile `@Inject(TOKEN)`                                    | `token<T>('Name')` ve `inject(Token)`                                                        | `Inject` export edilmez, derleme hatası; bkz. [Bağımlılıkları inject etme](https://vibejs.org/v0/server/modules#injecting-dependencies). Kimsenin sağlamadığı bir token ise [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) ile başarısız olur                   |
| `@Global()`                                                                      | `@Module({ global: true })`                                                                  | `Global` export edilmez, derleme hatası; bkz. [Modüller](https://vibejs.org/v0/server/modules#modules). Eksik bir `global: true` ise [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) olarak ortaya çıkar                                                         |
| Metotlar üzerinde `@Get()`, `@Post(':id')`                                       | `defineContract` içinde bir rota; `@Handle(contract.route)` ile karşılanır                   | Handler'sız bir rota için [VIBE9303](https://vibejs.org/v0/errors/VIBE9303)                                                                                                                                                                                        |
| `@Controller('users')`                                                           | `@Controller(contract)`; yol öneki contract'ın parçasıdır                                    | `@Controller` bir contract alır, bu yüzden string vermek derleme hatasıdır; bkz. [Rotalar](https://vibejs.org/v0/server/contracts#routes)                                                                                                                          |
| `@Body()`, `@Param()`, `@Query()`, `@Headers()`, `@Req()`                        | `ctx.body`, `ctx.params`, `ctx.query`, `ctx.headers`, `ctx.req`                              | Rotayla eşleşmeyen bir imza için [@Handle üzerinde TS1241](https://vibejs.org/v0/server/handlers#ts1241-on-handle)                                                                                                                                                 |
| `ValidationPipe`, DTO sınıfları, `ParseIntPipe`                                  | Contract içindeki Standard Schema şemaları: `body`, `query`, `params`                        | `ValidationPipe` ve `ParseIntPipe` export edilmez, derleme hatası; bkz. [Doğrulama](https://vibejs.org/v0/server/handlers#validation)                                                                                                                              |
| `NotFoundException` ve diğer exception sınıfları                                 | Contract'ta `errors: { CODE: 404 }` ile `ctx.fail('CODE', detail?)` veya `HttpError`         | Rotanın bildirmediği bir kod için [VIBE9502](https://vibejs.org/v0/errors/VIBE9502)                                                                                                                                                                                |
| `NestFactory.create(AppModule)`                                                  | `VibeFactory.create(AppModule, appOptions)`, ardından `listen()`                             | `NestFactory` export edilmez, derleme hatası; bkz. [Uygulamayı oluşturma](https://vibejs.org/v0/server/#creating-the-application)                                                                                                                                  |
| `app.useGlobalGuards()`, `app.useGlobalInterceptors()`, `app.useGlobalFilters()` | `AppOptions` içinde `guards`, `interceptors` ve `filters`                                    | `App` üzerinde `useGlobal*` metotları yok, derleme hatası; bkz. [Global enhancer'lar](https://vibejs.org/v0/server/pipeline#global-enhancers)                                                                                                                      |
| `app.use()` ve Express middleware                                                | `Middleware`: Fetch `Request` ve `Response` üzerinde `(req, next) => Promise<Response>`      | `app.use()` yok, derleme hatası; bkz. [Middleware](https://vibejs.org/v0/server/pipeline#middleware)                                                                                                                                                               |
| `@SetMetadata()` ve `Reflector`                                                  | `createMetadata<T>(name)` ve `ctx.getMetadata(key)`                                          | `SetMetadata` ve `Reflector` export edilmez, derleme hatası; bkz. [Metadata](https://vibejs.org/v0/server/pipeline#metadata)                                                                                                                                       |
| `@nestjs/testing`                                                                | `@usevibejs/server/testing` paketinden `overrideProvider()` ile `Test.createTestingModule()` | `@nestjs/testing` bir bağımlılık değil, çözümlenemeyen import; bkz. [Sunucuyu test etme](https://vibejs.org/v0/server/testing)                                                                                                                                     |
| `app.getHttpServer()` üzerinde Supertest                                         | `createClient(contracts, { baseUrl: '/api', fetch: app.fetch })`                             | `app.getHttpServer()` yok, derleme hatası; bkz. [Test etme](https://vibejs.org/v0/server/testing)                                                                                                                                                                  |
| `@nestjs/swagger` decorator'ları                                                 | `@usevibejs/server/openapi` paketinden `generateOpenApi(contracts, options)`                 | Paket bir bağımlılık değil, derleme hatası; bkz. [OpenAPI](https://vibejs.org/v0/server/contracts#openapi)                                                                                                                                                         |
| `@nestjs/config` ve `ConfigService.get()`                                        | `defineConfig(schema)`, sağlanıp inject edilecek tipli bir config sınıfı                     | `@nestjs/config` bir bağımlılık değil, çözümlenemeyen import; bkz. [Ortam yapılandırması](https://vibejs.org/v0/server/configuration#environment-config). Eksik veya geçersiz değişkenler ise [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) ile başarısız olur |
| `reflect-metadata` ve `emitDecoratorMetadata`                                    | İkisi de yok; yalnızca `experimentalDecorators: true`                                        | Hiçbir şey: sunucu üretilen metadata'yı asla okumaz, yani gereksiz yüktür; bkz. [TypeScript kurulumu](https://vibejs.org/v0/server/configuration#typescript-setup)                                                                                                 |
| Döngüsel provider'lar için `forwardRef()`                                        | Ortak kısmı, ikisinin de `inject()` ettiği üçüncü bir provider'a taşıyın                     | Provider döngüsü için [VIBE9103](https://vibejs.org/v0/errors/VIBE9103)                                                                                                                                                                                            |
| `forRoot()` dinamik modülleri                                                    | Aynısı: bir `DynamicModule` döndüren statik metot                                            | Modül sınıfında `@Module()` yoksa [VIBE9201](https://vibejs.org/v0/errors/VIBE9201)                                                                                                                                                                                |

## Yan yana bir controller {#a-controller-side-by-side}

NestJS controller'ı

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

bir contract ve bir controller'a dönüşür:

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

UI aynı rotayı `api.todos.findOne({ params: { id } })` ile çağırır ve sonucu 404 durumlu `TODO_NOT_FOUND` hatasına daraltır.

## vibe.js v0.1'de olmayanlar {#not-in-vibejs-v01}

- İstek kapsamlı (request-scoped) ve geçici (transient) provider'lar: her provider bir singleton'dır. İstek başına değerler `ctx.state` üzerine konur.
- Parametre decorator'ları ve özel pipe'lar: bir handler'ın tek bir `ctx`'i vardır ve şemalar girdileri dönüştürür.
- NestJS'in mikroservisleri, WebSocket'leri, GraphQL'i ve CLI schematic'leri.
