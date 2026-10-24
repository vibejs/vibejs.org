# توسيع vibe.js

كل ما يستخدمه التطبيق لتوسيع vibe.js هو API عام، لذا يمكن نقل ميزة من تطبيق إلى حزمة دون تغييرات.

## الخادم {#server}

### الوحدات القابلة للضبط {#configurable-modules}

الوحدة التي تحتاج إلى خيارات تكشف دالة ثابتة `forRoot(options)` تُرجع `DynamicModule`: صنف الوحدة مع مزوّدات وصادرات إضافية. تصبح الخيارات مزوّدًا، فتحقنها أصناف الوحدة نفسها:

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

يستورد التطبيق `MailModule.forRoot({ ... })`. تُضاف المزوّدات والمتحكمات والواردات والصادرات في الكائن المُرجَع إلى ما في `@Module()`. يُرجع كل استدعاء لـ `forRoot()` كائنًا جديدًا، وهو نسخة وحدة منفصلة؛ استورد النتيجة مرة واحدة وصدّرها، أو اجعلها `global`، لتشارك نسخة واحدة. وللخيارات القادمة من مزوّدات أخرى، وفّرها بـ `useFactory` و`inject` بدلًا من `useValue`.

### حزم الـ middleware {#middleware-packages}

الـ middleware دالة، لذا تصدّر الحزمة مصنعًا يأخذ الخيارات ويُرجع `Middleware`:

```ts
export function requireHeader(name: string): Middleware {
  return (req, next) => {
    if (!req.headers.has(name)) throw new HttpError(400, 'BAD_REQUEST', `Missing ${name}`);
    return next();
  };
}
```

يضيفه التطبيق إلى `AppOptions.middleware`. يُجاب عن الخطأ المرمي في middleware على أنه مشكلة (problem)، كما في الخطأ داخل handler.

### الـ guards والـ interceptors والمرشّحات القابلة لإعادة الاستخدام {#reusable-guards-interceptors-and-filters}

المعزِّزات (enhancers) أصناف بلا معاملات في الباني (constructor) تستدعي `inject()` لما تحتاجه، لذا يمكن لحزمة تصديرها بجانب وحدة توفّر اعتمادياتها. اضبطها عبر رمز خيارات (token) من `forRoot()`، كما سبق، لا عبر معاملات الباني التي لا تمرّرها الحاوية.

### البيانات الوصفية {#metadata}

يمنح `createMetadata<T>(name)` الحزمة مزخرفًا (decorator) مُنمَّطًا ومفتاحًا لقراءته مجددًا في guards وinterceptors الخاصة بها عبر `ctx.getMetadata(key)`:

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

ثم تكتب التطبيقات `@CacheFor(60)` على handler وتسجّل `CacheHeaders` بشكل عام أو بـ `@UseInterceptors()`.

راجع [الوحدات والمزوّدات](https://vibejs.org/v0/server/modules) و[الـ middleware والـ guards والـ interceptors والمرشّحات](https://vibejs.org/v0/server/pipeline) لمعرفة القواعد التي تتبعها هذه اللبنات.

## الواجهة {#ui}

### الإضافات {#plugins}

الإضافة (plugin) دالة تستقبل التطبيق، أو كائن له الدالة `install(app)`. يثبّتها `app.use(plugin, ...options)` مرة واحدة، ويفحص الخيارات مقابل النوع `Plugin<Options>` للإضافة؛ واستدعاء ثانٍ بالإضافة نفسها يُصدر التحذير [VIBE5304](https://vibejs.org/v0/errors/VIBE5304) ولا يفعل شيئًا. تزوّد الإضافة كل مكوّن بقيم عبر `app.provide()`، وتسجّل التنظيف عبر `app.onUnmount()`.

تصدّر حزمة أعلام الميزات (feature flags) في تطبيق المهام التجريبي مصنع إضافة: يأخذ خيارات، ويحمّل الأعلام مرة واحدة، ويوفّرها تحت مفتاح حقن خاص.

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

يثبّتها التطبيق بجانب الموجّه (router):

```ts
createApp(App).use(flagsPlugin()).mount('#app');
```

### التزويد والحقن {#provide-and-inject}

يجعل `app.provide(key, value)` القيمة متاحة لكل مكوّن في التطبيق؛ ويجعلها `provide(key, value)` داخل setup مكوّن متاحة لأحفاد ذلك المكوّن. يقرأ `inject(key)` أقرب قيمة، ويُرجع `inject(key, fallback)` القيمة `fallback` عندما لا يوفّر أحد `key`. نمّط المفاتيح بـ `InjectionKey<T>`، وهو رمز (symbol) يحمل نوع قيمته، فيُرجع `inject()` ذلك النوع.

### الـ composables {#composables}

الـ composable دالة يستدعيها setup لإعادة استخدام منطق ذي حالة: يمكنها قراءة الحقن، وإنشاء refs وقيم computed، وتسجيل خطافات دورة حياة المكوّن المستدعي. تقرأ حزمة الأعلام حقنها داخل composable، فلا ترى المكوّنات المفتاح أبدًا، ويحصل تطبيق بلا الإضافة على `false` لكل علم:

```ts
/** Whether the flag `name` is on; always `false` in an app without `flagsPlugin()`. */
export function useFlag(name: string): Readonly<Ref<boolean>> {
  const state = inject(FLAGS, null);
  return computed(() => state?.value[name] === true);
}
```

ثم تستدعي الصفحة `useFlag('removeDone')` في setup الخاص بها وتستخدم الـ ref في قالبها.

### الحدود {#limits}

- لا توجد مكوّنات عامة (global) ولا موجّهات (directives) مخصصة ولا mixins ولا خصائص عامة: تُصدر `app.component()` و`app.directive()` و`app.mixin()` الخطأ [VIBE5301](https://vibejs.org/v0/errors/VIBE5301). صدّر المكوّنات ليُستورَد، وسلوك العناصر كـ composables تأخذ ref للقالب، والقيم المشتركة عبر `app.provide()`.
- الحزم التي تشحن مكوّنات `.vibe` مخطط لها في الإصدار v0.2. وإلى ذلك الحين تصدّر الحزمة إضافات وcomposables ومفاتيح حقن وأنواعًا.
