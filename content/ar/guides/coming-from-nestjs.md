# القادم من NestJS

تعمل الوحدات (modules) والمزوّدات (providers) والمتحكمات (controllers) والـ guards والـ interceptors والمرشّحات (filters) وخطافات دورة الحياة كما تتوقع. وثلاثة أشياء تختلف، ومعظم الجدول أدناه ناتج عنها:

- **لا أنواع منعكسة (reflected).** لا يستخدم vibe.js `emitDecoratorMetadata` ولا `reflect-metadata`. الاعتماديات حقول تُهيَّأ بـ `inject(Token)`، فهي صريحة تحت أي مترجم (compiler).
- **عقود بدل مزخرفات المسارات.** تُعلَن المسارات والمدخلات والاستجابات والأخطاء مرة واحدة بـ `defineContract`. يعالجها الخادم بـ `@Handle(route)`؛ وتستدعيها الواجهة بـ `createClient`، مُنمَّطة بالكامل ودون توليد شيفرة.
- **`ctx` مُنمَّط واحد بدل مزخرفات المعاملات.** يأخذ الـ handler المعامل `ctx: Ctx<typeof contract.route>` الذي يحمل المعاملات والاستعلام والترويسات والجسم بعد التحقق منها.

## الأساليب {#idioms}

| NestJS                                                                           | vibe.js                                                                              | ما الذي يكشف الصيغة القديمة                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@Injectable()` على مزوّد                                                         | صنف عادي مدرج في `providers`                                                         | `@Injectable` غير مُصدَّر، خطأ ترجمة؛ راجع [المزوّدات](https://vibejs.org/v0/server/modules#providers)                                                                                                                                          |
| الحقن عبر الباني: `constructor(private db: Db)`                                  | `private readonly db = inject(Db)`                                                   | [VIBE9104](https://vibejs.org/v0/errors/VIBE9104) عند بدء التشغيل                                                                                                                                                                           |
| `@Inject(TOKEN)` مع رمز (token) نصي أو symbol                                    | `token<T>('Name')` و`inject(Token)`                                                  | `Inject` غير مُصدَّر، خطأ ترجمة؛ راجع [حقن الاعتماديات](https://vibejs.org/v0/server/modules#injecting-dependencies). والرمز الذي لا يوفّره أحد يفشل بعدها بـ [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                                   |
| `@Global()`                                                                      | `@Module({ global: true })`                                                          | `Global` غير مُصدَّر، خطأ ترجمة؛ راجع [الوحدات](https://vibejs.org/v0/server/modules#modules). وغياب `global: true` يظهر بعدها كـ [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)                                                            |
| `@Get()` و`@Post(':id')` على الدوال                                              | مسار في `defineContract`، يخدمه `@Handle(contract.route)`                            | [VIBE9303](https://vibejs.org/v0/errors/VIBE9303) لمسار بلا handler                                                                                                                                                                          |
| `@Controller('users')`                                                           | `@Controller(contract)`؛ وبادئة المسار جزء من العقد                                  | يأخذ `@Controller` عقدًا، فالنص خطأ ترجمة؛ راجع [المسارات](https://vibejs.org/v0/server/contracts#routes)                                                                                                                                    |
| `@Body()` و`@Param()` و`@Query()` و`@Headers()` و`@Req()`                        | `ctx.body` و`ctx.params` و`ctx.query` و`ctx.headers` و`ctx.req`                      | [TS1241 على @Handle](https://vibejs.org/v0/server/handlers#ts1241-on-handle) لتوقيع لا يطابق المسار                                                                                                                                          |
| `ValidationPipe` وأصناف DTO و`ParseIntPipe`                                      | مخططات Standard Schema في العقد: `body` و`query` و`params`                           | `ValidationPipe` و`ParseIntPipe` غير مُصدَّرتين، خطأ ترجمة؛ راجع [التحقق](https://vibejs.org/v0/server/handlers#validation)                                                                                                                    |
| `NotFoundException` وأصناف الاستثناءات الأخرى                                      | `ctx.fail('CODE', detail?)` مع `errors: { CODE: 404 }` في العقد، أو `HttpError`      | [VIBE9502](https://vibejs.org/v0/errors/VIBE9502) لرمز لا يعلنه المسار                                                                                                                                                                       |
| `NestFactory.create(AppModule)`                                                  | `VibeFactory.create(AppModule, appOptions)`، ثم `listen()`                           | `NestFactory` غير مُصدَّر، خطأ ترجمة؛ راجع [إنشاء التطبيق](https://vibejs.org/v0/server/#creating-the-application)                                                                                                                             |
| `app.useGlobalGuards()` و`app.useGlobalInterceptors()` و`app.useGlobalFilters()` | `guards` و`interceptors` و`filters` في `AppOptions`                                  | ليس لـ `App` دوال `useGlobal*`، خطأ ترجمة؛ راجع [المعزِّزات العامة](https://vibejs.org/v0/server/pipeline#global-enhancers)                                                                                                                   |
| `app.use()` وmiddleware الخاص بـ Express                                         | `Middleware`: `(req, next) => Promise<Response>` على `Request` و`Response` من Fetch  | `app.use()` غير موجودة، خطأ ترجمة؛ راجع [الـ middleware](https://vibejs.org/v0/server/pipeline#middleware)                                                                                                                                  |
| `@SetMetadata()` و`Reflector`                                                    | `createMetadata<T>(name)` و`ctx.getMetadata(key)`                                    | `SetMetadata` و`Reflector` غير مُصدَّرتين، خطأ ترجمة؛ راجع [البيانات الوصفية](https://vibejs.org/v0/server/pipeline#metadata)                                                                                                                  |
| `@nestjs/testing`                                                                | `Test.createTestingModule()` من `@usevibejs/server/testing`، مع `overrideProvider()` | `@nestjs/testing` ليست اعتمادية، استيراد غير محلول؛ راجع [اختبار الخادم](https://vibejs.org/v0/server/testing)                                                                                                                              |
| Supertest مقابل `app.getHttpServer()`                                            | `createClient(contracts, { baseUrl: '/api', fetch: app.fetch })`                     | `app.getHttpServer()` غير موجودة، خطأ ترجمة؛ راجع [الاختبار](https://vibejs.org/v0/server/testing)                                                                                                                                           |
| مزخرفات `@nestjs/swagger`                                                        | `generateOpenApi(contracts, options)` من `@usevibejs/server/openapi`                 | الحزمة ليست اعتمادية، خطأ ترجمة؛ راجع [OpenAPI](https://vibejs.org/v0/server/contracts#openapi)                                                                                                                                             |
| `@nestjs/config` و`ConfigService.get()`                                          | `defineConfig(schema)`، صنف إعدادات مُنمَّط للتوفير والحقن                              | `@nestjs/config` ليست اعتمادية، استيراد غير محلول؛ راجع [إعدادات البيئة](https://vibejs.org/v0/server/configuration#environment-config). والمتغيرات المفقودة أو غير الصالحة تفشل بعدها بـ [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) |
| `reflect-metadata` و`emitDecoratorMetadata`                                      | لا هذا ولا ذاك؛ فقط `experimentalDecorators: true`                                     | لا شيء: لا يقرأ الخادم البيانات الوصفية المُنتَجة أبدًا، فهي حمل زائد؛ راجع [إعداد TypeScript](https://vibejs.org/v0/server/configuration#typescript-setup)                                                                                      |
| `forwardRef()` للمزوّدات الدائرية                                                 | انقل الجزء المشترك إلى مزوّد ثالث يحقنه كلاهما بـ `inject()`                           | [VIBE9103](https://vibejs.org/v0/errors/VIBE9103) لدورة بين المزوّدات                                                                                                                                                                        |
| وحدات `forRoot()` الديناميكية                                                    | الشيء نفسه: دالة ثابتة تُرجع `DynamicModule`                                          | [VIBE9201](https://vibejs.org/v0/errors/VIBE9201) عندما يفتقر صنف الوحدة إلى `@Module()`                                                                                                                                                    |

## متحكم جنبًا إلى جنب {#a-controller-side-by-side}

المتحكم في NestJS

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

تستدعي الواجهة المسار نفسه بـ `api.todos.findOne({ params: { id } })` وتضيّق النتيجة إلى `TODO_NOT_FOUND` بالحالة 404.

## ما ليس في vibe.js v0.1 {#not-in-vibejs-v01}

- المزوّدات المحدودة بالطلب (request-scoped) والمؤقتة (transient): كل مزوّد نسخة وحيدة (singleton). توضع القيم الخاصة بكل طلب في `ctx.state`.
- مزخرفات المعاملات والـ pipes المخصصة: للـ handler واحد `ctx`، وتحوّل المخططات المدخلات.
- الخدمات المصغّرة (microservices) وWebSockets وGraphQL ومخططات (schematics) سطر أوامر NestJS.
