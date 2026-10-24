# قادم من NestJS

الوحدات والمزوّدات والمتحكمات والـ guards والـ interceptors والمرشّحات وخطافات دورة الحياة تعمل كما تتوقع. هناك ثلاثة فروق، ومنها ينبع معظم ما في الجدول أدناه:

- **لا أنواع منعكسة (reflected types).** لا يستخدم vibe.js الخيار `emitDecoratorMetadata` ولا `reflect-metadata`. الاعتماديات حقول تُهيَّأ بـ `inject(Token)`، فتبقى صريحة مع أي مترجم.
- **عقود بدل مزخرفات المسارات.** تعرّف المسارات والمدخلات والاستجابات والأخطاء مرة واحدة بـ `defineContract`. يعالجها الخادم بـ `@Handle(route)`، وتستدعيها الواجهة بـ `createClient`، بأنواع كاملة ودون توليد كود.
- **`ctx` واحد ذو نوع بدل مزخرفات المعاملات.** يأخذ المعالج `ctx: Ctx<typeof contract.route>`، وفيه المعاملات والاستعلام (query) والترويسات وجسم الطلب بعد التحقق من صحتها.

## الأنماط الشائعة {#idioms}

| NestJS                                                                           | vibe.js                                                                              | ما الذي يكشف الصيغة القديمة                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@Injectable()` على مزوّد                                                         | صنف عادي مذكور في `providers`                                                        | `@Injectable` غير مُصدَّر، فيظهر خطأ ترجمة؛ راجع [المزوّدات](https://vibejs.org/v0/server/modules#providers)                                                                                                                                        |
| الحقن عبر الباني: `constructor(private db: Db)`                                  | `private readonly db = inject(Db)`                                                   | [VIBE9104](https://vibejs.org/v0/errors/VIBE9104) عند بدء التشغيل                                                                                                                                                                               |
| `@Inject(TOKEN)` مع رمز (token) من نوع string أو symbol                          | `token<T>('Name')` و`inject(Token)`                                                  | `Inject` غير مُصدَّر، فيظهر خطأ ترجمة؛ راجع [حقن الاعتماديات](https://vibejs.org/v0/server/modules#injecting-dependencies). والرمز الذي لا يزوّده أحد يفشل بعدها بـ [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                                 |
| `@Global()`                                                                      | `@Module({ global: true })`                                                          | `Global` غير مُصدَّر، فيظهر خطأ ترجمة؛ راجع [الوحدات](https://vibejs.org/v0/server/modules#modules). وإذا نسيت `global: true` ظهر بعدها [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                                                          |
| `@Get()` و`@Post(':id')` على الدوال                                              | مسار في `defineContract`، يخدمه `@Handle(contract.route)`                            | [VIBE9303](https://vibejs.org/v0/errors/VIBE9303) للمسار الذي ليس له معالج                                                                                                                                                                      |
| `@Controller('users')`                                                           | `@Controller(contract)`، وبادئة المسار جزء من العقد                                  | يأخذ `@Controller` عقدًا، فالنص (string) خطأ ترجمة؛ راجع [المسارات](https://vibejs.org/v0/server/contracts#routes)                                                                                                                               |
| `@Body()` و`@Param()` و`@Query()` و`@Headers()` و`@Req()`                        | `ctx.body` و`ctx.params` و`ctx.query` و`ctx.headers` و`ctx.req`                      | [TS1241 على @Handle](https://vibejs.org/v0/server/handlers#ts1241-on-handle) للتوقيع الذي لا يطابق المسار                                                                                                                                        |
| `ValidationPipe` وأصناف DTO و`ParseIntPipe`                                      | مخططات Standard Schema داخل العقد: `body` و`query` و`params`                         | `ValidationPipe` و`ParseIntPipe` غير مُصدَّرين، فيظهر خطأ ترجمة؛ راجع [التحقق من الصحة](https://vibejs.org/v0/server/handlers#validation)                                                                                                          |
| `NotFoundException` وبقية أصناف الاستثناءات                                       | `ctx.fail('CODE', detail?)` مع `errors: { CODE: 404 }` في العقد، أو `HttpError`      | [VIBE9502](https://vibejs.org/v0/errors/VIBE9502) للرمز الذي لا يعلنه المسار                                                                                                                                                                     |
| `NestFactory.create(AppModule)`                                                  | `VibeFactory.create(AppModule, appOptions)`، ثم `listen()`                           | `NestFactory` غير مُصدَّر، فيظهر خطأ ترجمة؛ راجع [إنشاء التطبيق](https://vibejs.org/v0/server/#creating-the-application)                                                                                                                           |
| `app.useGlobalGuards()` و`app.useGlobalInterceptors()` و`app.useGlobalFilters()` | `guards` و`interceptors` و`filters` في `AppOptions`                                  | ليس في `App` دوال `useGlobal*`، فيظهر خطأ ترجمة؛ راجع [المحسِّنات العامة](https://vibejs.org/v0/server/pipeline#global-enhancers)                                                                                                                 |
| `app.use()` وmiddleware من Express                                               | `Middleware`: `(req, next) => Promise<Response>` على `Request` و`Response` من Fetch  | `app.use()` غير موجود، فيظهر خطأ ترجمة؛ راجع [Middleware](https://vibejs.org/v0/server/pipeline#middleware)                                                                                                                                     |
| `@SetMetadata()` و`Reflector`                                                    | `createMetadata<T>(name)` و`ctx.getMetadata(key)`                                    | `SetMetadata` و`Reflector` غير مُصدَّرين، فيظهر خطأ ترجمة؛ راجع [البيانات الوصفية](https://vibejs.org/v0/server/pipeline#metadata)                                                                                                                 |
| `@nestjs/testing`                                                                | `Test.createTestingModule()` من `@usevibejs/server/testing`، مع `overrideProvider()` | `@nestjs/testing` ليست من الاعتماديات، فيفشل حل الاستيراد؛ راجع [اختبار الخادم](https://vibejs.org/v0/server/testing)                                                                                                                             |
| Supertest على `app.getHttpServer()`                                              | `createClient(contracts, { baseUrl: '/api', fetch: app.fetch })`                     | `app.getHttpServer()` غير موجود، فيظهر خطأ ترجمة؛ راجع [الاختبار](https://vibejs.org/v0/server/testing)                                                                                                                                          |
| مزخرفات `@nestjs/swagger`                                                        | `generateOpenApi(contracts, options)` من `@usevibejs/server/openapi`                 | الحزمة ليست من الاعتماديات، فيظهر خطأ ترجمة؛ راجع [OpenAPI](https://vibejs.org/v0/server/contracts#openapi)                                                                                                                                      |
| `@nestjs/config` و`ConfigService.get()`                                          | `defineConfig(schema)`، صنف إعدادات ذو نوع تزوّده وتحقنه                              | `@nestjs/config` ليست من الاعتماديات، فيفشل حل الاستيراد؛ راجع [إعدادات البيئة](https://vibejs.org/v0/server/configuration#environment-config). والمتغيرات الناقصة أو غير الصالحة تفشل بعدها بـ [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) |
| `reflect-metadata` و`emitDecoratorMetadata`                                      | لا هذا ولا ذاك، بل `experimentalDecorators: true` فقط                                  | لا شيء: الخادم لا يقرأ البيانات الوصفية المولَّدة أبدًا، فهي وزن زائد بلا فائدة؛ راجع [إعداد TypeScript](https://vibejs.org/v0/server/configuration#typescript-setup)                                                                                 |
| `forwardRef()` للمزوّدات الدائرية                                                 | انقل الجزء المشترك إلى مزوّد ثالث يحقنه الاثنان عبر `inject()`                         | [VIBE9103](https://vibejs.org/v0/errors/VIBE9103) لدورة بين المزوّدات                                                                                                                                                                            |
| الوحدات الديناميكية عبر `forRoot()`                                              | الشيء نفسه: دالة ثابتة تعيد `DynamicModule`                                          | [VIBE9201](https://vibejs.org/v0/errors/VIBE9201) إذا لم يكن على صنف الوحدة `@Module()`                                                                                                                                                         |

## متحكم في المقارنة {#a-controller-side-by-side}

هذا المتحكم في NestJS

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

يصبح عقدًا ومتحكمًا:

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

تستدعي الواجهة المسار نفسه بـ `api.todos.findOne({ params: { id } })`، وتضيّق النتيجة إلى `TODO_NOT_FOUND` مع الحالة 404.

## غير موجود في vibe.js v0.1 {#not-in-vibejs-v01}

- المزوّدات المحصورة في الطلب (request-scoped) والعابرة (transient): كل مزوّد نسخة وحيدة (singleton). ضع القيم الخاصة بكل طلب في `ctx.state`.
- مزخرفات المعاملات والـ pipes المخصصة: للمعالج `ctx` واحد، والمخططات هي التي تحوّل المدخلات.
- الخدمات المصغّرة (microservices) وWebSockets وGraphQL، ومخططات التوليد (schematics) في سطر أوامر NestJS.
