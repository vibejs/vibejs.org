# توسيع vibe.js

كل ما يستخدمه التطبيق لتوسيع vibe.js جزء من الـ API العامة، لذا يمكنك نقل ميزة من التطبيق إلى حزمة مستقلة دون تعديلها.

## الخادم {#server}

### وحدات قابلة للضبط {#configurable-modules}

الوحدة التي تحتاج إلى خيارات تعرض دالة ثابتة `forRoot(options)` تعيد `DynamicModule`، أي صنف الوحدة مع مزوّدات وصادرات إضافية. تصبح الخيارات مزوّدًا، فتحقنها أصناف الوحدة نفسها:

```ts
export interface MailOptions {
  readonly from: string;
  readonly send: (message: { from: string; to: string; text: string }) => Promise<void>;
}

const MAIL_OPTIONS = token<MailOptions>('MailOptions');

export class Mailer {
  private readonly options = inject(MAIL_OPTIONS);

  send(to: string, text: string): Promise<void> {
    return this.options.send({ from: this.options.from, to, text });
  }
}

@Module({ providers: [Mailer], exports: [Mailer] })
export class MailModule {
  static forRoot(options: MailOptions): DynamicModule {
    return {
      module: MailModule,
      global: true,
      providers: [{ provide: MAIL_OPTIONS, useValue: options }],
    };
  }
}
```

يستورد التطبيق `MailModule.forRoot({ ... })`. ويُضاف ما في الكائن المُعاد من مزوّدات ومتحكمات وواردات وصادرات إلى ما في `@Module()`. كل استدعاء لـ `forRoot()` يعيد كائنًا جديدًا، أي نسخة منفصلة من الوحدة. لتتشارك نسخة واحدة، استورد الناتج مرة واحدة وصدّره، أو اجعله `global`. وإذا كانت الخيارات تأتي من مزوّدات أخرى، فزوّدها بـ `useFactory` و`inject` بدل `useValue`.

### حزم الـ middleware {#middleware-packages}

الـ middleware دالة، لذا تصدّر الحزمة دالة مصنع تأخذ الخيارات وتعيد `Middleware`:

```ts
export function requireHeader(name: string): Middleware {
  return (req, next) => {
    if (!req.headers.has(name)) throw new HttpError(400, 'BAD_REQUEST', `Missing ${name}`);
    return next();
  };
}
```

يضيفها التطبيق إلى `AppOptions.middleware`. وإذا رمى الـ middleware خطأً، جاء الرد وصفًا للمشكلة (problem)، تمامًا كما يحدث مع الخطأ داخل المعالج.

### guards وinterceptors ومرشّحات قابلة لإعادة الاستخدام {#reusable-guards-interceptors-and-filters}

المحسِّنات (enhancers) أصناف بلا معاملات في الباني، تجلب ما تحتاج إليه عبر `inject()`. لذا تستطيع الحزمة أن تصدّرها بجانب وحدة تزوّد اعتمادياتها. اضبطها عبر رمز (token) للخيارات يأتي من `forRoot()` كما في المثال السابق، لا عبر معاملات الباني، فالحاوية لا تمرّرها.

### البيانات الوصفية {#metadata}

تعطي `createMetadata<T>(name)` الحزمة مزخرفًا (decorator) ذا نوع، ومفتاحًا تقرأ به القيمة لاحقًا في الـ guards والـ interceptors عبر `ctx.getMetadata(key)`:

```ts
export const CacheFor = createMetadata<number>('cacheFor');

export class CacheHeaders implements Interceptor {
  async intercept(ctx: RequestContext, next: () => Promise<unknown>): Promise<unknown> {
    const seconds = ctx.getMetadata(CacheFor);
    if (seconds !== undefined) ctx.responseHeaders.set('cache-control', `max-age=${seconds}`);
    return next();
  }
}
```

بعدها يكتب التطبيق `@CacheFor(60)` على المعالج، ويسجّل `CacheHeaders` على مستوى التطبيق كله أو عبر `@UseInterceptors()`.

راجع [الوحدات والمزوّدات](https://vibejs.org/v0/server/modules) و[middleware وguards وinterceptors والمرشّحات](https://vibejs.org/v0/server/pipeline) لتعرف القواعد التي تتبعها هذه اللبنات.

## الواجهة {#ui}

### الإضافات {#plugins}

الإضافة (plugin) دالة تستقبل التطبيق، أو كائن فيه الدالة `install(app)`. يثبّتها `app.use(plugin, ...options)` مرة واحدة، ويتحقق من أن الخيارات تطابق نوعها `Plugin<Options>`. وإذا استدعيته مرة ثانية بالإضافة نفسها أطلق التحذير [VIBE5304](https://vibejs.org/v0/errors/VIBE5304) ولم يفعل شيئًا. تزوّد الإضافة كل المكوّنات بالقيم عبر `app.provide()`، وتسجّل التنظيف عبر `app.onUnmount()`.

حزمة رايات الميزات (feature flags) في مثال تطبيق المهام تصدّر مصنع إضافة: يأخذ الخيارات، ويجلب الرايات مرة واحدة، ويزوّدها تحت مفتاح حقن خاص.

```ts
export interface FlagsPluginOptions {
  /** Where the API is mounted; `/api` by default. */
  baseUrl?: string;
  fetch?: ClientOptions['fetch'];
}

const FLAGS: InjectionKey<ShallowRef<Record<string, boolean>>> = Symbol('flags');

/** Loads the flags from `GET <baseUrl>/flags` once; until then, and after an error, every flag is off. */
export const flagsPlugin =
  (options: FlagsPluginOptions = {}): Plugin =>
  (app) => {
    const state = shallowRef<Record<string, boolean>>({});
    app.provide(FLAGS, state);
    const api = createClient(
      { flags },
      { baseUrl: options.baseUrl ?? '/api', fetch: options.fetch },
    );
    void api.flags.list().then((r) => {
      if (r.ok) state.value = r.data;
    });
  };
```

ويثبّتها التطبيق بجانب الموجِّه:

```ts
createApp(App).use(flagsPlugin()).mount('#app');
```

### التزويد والحقن {#provide-and-inject}

يجعل `app.provide(key, value)` القيمة متاحة لكل مكوّنات التطبيق، أما `provide(key, value)` داخل setup في مكوّن فيجعلها متاحة لأحفاد ذلك المكوّن. يقرأ `inject(key)` أقرب قيمة مزوَّدة، ويعيد `inject(key, fallback)` القيمة `fallback` إذا لم يزوّد أحد `key`. اكتب أنواع المفاتيح بـ `InjectionKey<T>`، وهو رمز (symbol) يحمل نوع قيمته، فيعيد `inject()` ذلك النوع.

### الـ composables {#composables}

الـ composable دالة تستدعيها داخل setup لتعيد استخدام منطق له حالة. يمكنها أن تقرأ القيم المحقونة، وتنشئ refs وقيم computed، وتسجّل خطافات دورة الحياة للمكوّن الذي استدعاها. حزمة الرايات تقرأ قيمتها المحقونة داخل composable، فلا ترى المكوّنات المفتاح أبدًا، والتطبيق الذي لا يستخدم الإضافة يحصل على `false` لكل راية:

```ts
/** Whether the flag `name` is on; always `false` in an app without `flagsPlugin()`. */
export function useFlag(name: string): Readonly<Ref<boolean>> {
  const state = inject(FLAGS, null);
  return computed(() => state?.value[name] === true);
}
```

بعدها تستدعي الصفحة `useFlag('removeDone')` في setup، وتستخدم الـ ref في قالبها.

### الحدود {#limits}

- لا توجد مكوّنات عامة (global components)، ولا توجيهات مخصّصة (custom directives)، ولا mixins، ولا خصائص عامة: `app.component()` و`app.directive()` و`app.mixin()` ترمي [VIBE5301](https://vibejs.org/v0/errors/VIBE5301). صدّر المكوّنات ليستوردها من يحتاج إليها، واجعل سلوك العناصر composables تأخذ template ref، وشارك القيم عبر `app.provide()`.
- الحزم التي تضم مكوّنات `.vibe` مخطط لها في v0.2. وحتى ذلك الحين تصدّر الحزمة إضافات وcomposables ومفاتيح حقن وأنواعًا.
