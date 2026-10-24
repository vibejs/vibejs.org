# vibe.js'i genişletmek

Bir uygulamanın vibe.js'i genişletmek için kullandığı her şey public API. Yani bir özelliği hiç değiştirmeden uygulamadan bir pakete taşıyabilirsin.

## Sunucu {#server}

### Ayarlanabilir modüller {#configurable-modules}

Seçenek alan bir modül, `DynamicModule` döndüren statik bir `forRoot(options)` sunar. `DynamicModule` dediğimiz şey modül sınıfı, üstüne de ek provider'lar ve export'lar. Seçenekler bir provider'a dönüşür, böylece modülün kendi sınıfları onları inject eder:

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

Uygulama `MailModule.forRoot({ ... })` import eder. Dönen nesnedeki provider'lar, controller'lar, import'lar ve export'lar `@Module()` içindekilere eklenir. Her `forRoot()` çağrısı yeni bir nesne, yani ayrı bir modül örneği döner. Tek bir örneği paylaşmak istiyorsan sonucu bir kez import edip export et ya da `global` yap. Seçenekler başka provider'lardan geliyorsa `useValue` yerine `useFactory` ve `inject` ile ver.

### Middleware paketleri {#middleware-packages}

Middleware bir fonksiyon. O yüzden paket, seçenek alıp `Middleware` döndüren bir factory export eder:

```ts
export function requireHeader(name: string): Middleware {
  return (req, next) => {
    if (!req.headers.has(name)) throw new HttpError(400, 'BAD_REQUEST', `Missing ${name}`);
    return next();
  };
}
```

Uygulama onu `AppOptions.middleware` dizisine ekler. Middleware'de fırlatılan bir hata, handler'daki bir hata gibi problem yanıtına dönüşür.

### Yeniden kullanılabilir guard, interceptor ve filter'lar {#reusable-guards-interceptors-and-filters}

Enhancer'lar constructor parametresi olmayan sınıflardır; ihtiyaçlarını `inject()` ile alırlar. Bu yüzden bir paket onları, bağımlılıklarını sağlayan bir modülün yanında export edebilir. Onları constructor argümanlarıyla değil, yukarıdaki gibi `forRoot()`'tan gelen bir seçenek token'ıyla ayarla. Container constructor argümanı geçmez.

### Metadata {#metadata}

`createMetadata<T>(name)` pakete tipli bir dekoratör ve bir anahtar verir. Paket bu anahtarla değeri guard ve interceptor'larında `ctx.getMetadata(key)` ile geri okur:

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

Uygulama bir handler'ın üstüne `@CacheFor(60)` yazar ve `CacheHeaders`'ı global olarak ya da `@UseInterceptors()` ile kaydeder.

Bu yapı taşlarının uyduğu kurallar için [Modüller ve provider'lar](https://vibejs.org/v0/server/modules) ile [Middleware, guard, interceptor ve filter'lar](https://vibejs.org/v0/server/pipeline) sayfalarına bak.

## UI {#ui}

### Plugin'ler {#plugins}

Plugin, uygulamayı parametre olarak alan bir fonksiyon ya da `install(app)` metodu olan bir nesnedir. `app.use(plugin, ...options)` onu bir kez kurar ve seçenekleri plugin'in `Plugin<Options>` tipine göre denetler. Aynı plugin'le ikinci kez çağırırsan [VIBE5304](https://vibejs.org/v0/errors/VIBE5304) uyarısı verir ve hiçbir şey yapmaz. Plugin, `app.provide()` ile her bileşene değer sağlar ve temizlik işini `app.onUnmount()` ile kaydeder.

Örnek todo uygulamasındaki feature flag paketi bir plugin factory export ediyor: seçenekleri alıyor, flag'leri bir kez yüklüyor ve onları private bir injection anahtarı altında sağlıyor.

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

Uygulama onu router'ın yanına kurar:

```ts
createApp(App).use(flagsPlugin()).mount('#app');
```

### Provide ve inject {#provide-and-inject}

`app.provide(key, value)` bir değeri uygulamadaki bütün bileşenlere açar. Bir bileşenin setup'ında `provide(key, value)` ise değeri yalnızca o bileşenin altındakilere açar. `inject(key)` en yakındakini okur. `inject(key, fallback)` de `key`'i sağlayan kimse yoksa `fallback` döner. Anahtarlara `InjectionKey<T>` ile tip ver. Bu, değerinin tipini taşıyan bir symbol; böylece `inject()` o tipi döner.

### Composable'lar {#composables}

Composable, durumlu mantığı yeniden kullanmak için setup içinden çağırdığın bir fonksiyon. Injection okuyabilir, ref ve computed oluşturabilir, çağıran bileşenin yaşam döngüsü hook'larını kaydedebilir. Flag paketi injection'ını bir composable içinde okuyor. Böylece bileşenler anahtarı hiç görmüyor ve plugin'i olmayan bir uygulama her flag için `false` alıyor:

```ts
/** Whether the flag `name` is on; always `false` in an app without `flagsPlugin()`. */
export function useFlag(name: string): Readonly<Ref<boolean>> {
  const state = inject(FLAGS, null);
  return computed(() => state?.value[name] === true);
}
```

Bir sayfa setup'ında `useFlag('removeDone')` çağırır ve ref'i şablonunda kullanır.

### Sınırlar {#limits}

- Global bileşen, özel direktif, mixin ya da global property yok: `app.component()`, `app.directive()` ve `app.mixin()` [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) fırlatır. Bileşenleri export et, kullanan import etsin. Eleman davranışını template ref alan bir composable'a koy, paylaşılan değerleri de `app.provide()` ile ver.
- `.vibe` bileşeni içeren paketler v0.2 için planlanıyor. O zamana kadar bir paket plugin, composable, injection anahtarı ve tip export eder.
