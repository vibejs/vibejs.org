# vibe.js'i genişletme

Bir uygulamanın vibe.js'i genişletmek için kullandığı her şey herkese açık API'dir; bu yüzden bir özellik, değişiklik gerektirmeden uygulamadan bir pakete taşınabilir.

## Sunucu {#server}

### Yapılandırılabilir modüller {#configurable-modules}

Seçeneklere ihtiyaç duyan bir modül, bir `DynamicModule` döndüren statik bir `forRoot(options)` sunar: modül sınıfı ile ek provider'lar ve export'lar. Seçenekler bir provider olur; böylece modülün kendi sınıfları onları inject edebilir:

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

Bir uygulama `MailModule.forRoot({ ... })` çağrısını import eder. Döndürülen nesnenin provider'ları, controller'ları, import'ları ve export'ları `@Module()` içindekilere eklenir. Her `forRoot()` çağrısı yeni bir nesne, yani ayrı bir modül örneği döndürür; tek bir örneği paylaşmak için sonucu bir kez import edip export edin veya `global` yapın. Başka provider'lardan gelen seçenekler için, `useValue` yerine `useFactory` ve `inject` ile sağlayın.

### Middleware paketleri {#middleware-packages}

Bir middleware bir fonksiyondur; bu yüzden bir paket, seçenek alıp bir `Middleware` döndüren bir factory export eder:

```ts
export function requireHeader(name: string): Middleware {
  return (req, next) => {
    if (!req.headers.has(name)) throw new HttpError(400, 'BAD_REQUEST', `Missing ${name}`);
    return next();
  };
}
```

Uygulama bunu `AppOptions.middleware` içine ekler. Bir middleware'de fırlatılan hata, bir handler'daki hata gibi bir problem olarak yanıtlanır.

### Yeniden kullanılabilir guard'lar, interceptor'lar ve filter'lar {#reusable-guards-interceptors-and-filters}

Enhancer'lar, constructor parametresi olmayan ve ihtiyaç duyduklarını `inject()` ile alan sınıflardır; bu yüzden bir paket, bağımlılıklarını sağlayan bir modülün yanında bunları export edebilir. Bunları, container'ın geçirmediği constructor argümanlarıyla değil, yukarıdaki gibi `forRoot()` ile gelen bir seçenek token'ı üzerinden yapılandırın.

### Metadata {#metadata}

`createMetadata<T>(name)` bir pakete tipli bir decorator ve guard'larında ile interceptor'larında `ctx.getMetadata(key)` ile geri okumak için anahtarı verir:

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

Uygulamalar daha sonra bir handler üzerine `@CacheFor(60)` yazar ve `CacheHeaders` sınıfını genel olarak veya `@UseInterceptors()` ile kaydeder.

Bu yapı taşlarının uyduğu kurallar için [Modüller ve provider'lar](https://vibejs.org/v0/server/modules) ile [Middleware, guard'lar, interceptor'lar ve filter'lar](https://vibejs.org/v0/server/pipeline) sayfalarına bakın.

## UI {#ui}

### Plugin'ler {#plugins}

Bir plugin, app'i alan bir fonksiyon veya `install(app)` metodu olan bir nesnedir. `app.use(plugin, ...options)` onu bir kez kurar ve seçenekleri plugin'in `Plugin<Options>` tipine göre denetler; aynı plugin ile ikinci bir çağrı [VIBE5304](https://vibejs.org/v0/errors/VIBE5304) uyarısı verir ve hiçbir şey yapmaz. Bir plugin, `app.provide()` ile her bileşene değer sağlar ve `app.onUnmount()` ile temizlik kaydeder.

Örnek todo uygulamasının feature flag paketi bir plugin factory export eder: seçenek alır, flag'leri bir kez yükler ve onları özel bir injection anahtarı altında sağlar.

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

Uygulama bunu router'ın yanına kurar:

```ts
createApp(App).use(flagsPlugin()).mount('#app');
```

### Provide ve inject {#provide-and-inject}

`app.provide(key, value)` bir değeri app'in her bileşenine sunar; bir bileşenin setup'ında `provide(key, value)` ise onu o bileşenin alt öğelerine sunar. `inject(key)` en yakın olanı okur; `inject(key, fallback)` ise hiçbir şey `key` sağlamıyorsa `fallback` döndürür. Anahtarları, değerinin tipini taşıyan bir symbol olan `InjectionKey<T>` ile tipleyin; böylece `inject()` o tipi döndürür.

### Composable'lar {#composables}

Bir composable, durumlu mantığı yeniden kullanmak için setup'ın çağırdığı bir fonksiyondur: injection'ları okuyabilir, ref'ler ve computed değerler oluşturabilir ve çağıran bileşenin yaşam döngüsü hook'larını kaydedebilir. Flag paketi injection'ını bir composable içinde okur; böylece bileşenler anahtarı hiç görmez ve plugin'siz bir app her flag için `false` alır:

```ts
/** Whether the flag `name` is on; always `false` in an app without `flagsPlugin()`. */
export function useFlag(name: string): Readonly<Ref<boolean>> {
  const state = inject(FLAGS, null);
  return computed(() => state?.value[name] === true);
}
```

Bir sayfa daha sonra setup'ında `useFlag('removeDone')` çağırır ve ref'i template'inde kullanır.

### Sınırlar {#limits}

- Global bileşen, özel direktif, mixin veya global özellik yoktur: `app.component()`, `app.directive()` ve `app.mixin()` [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) fırlatır. Bileşenleri import için export edin, öğe davranışını bir template ref alan composable'lar olarak, paylaşılan değerleri de `app.provide()` ile sunun.
- `.vibe` bileşenleri içeren paketler v0.2 için planlanmıştır. O zamana kadar bir paket plugin'leri, composable'ları, injection anahtarlarını ve tipleri export eder.
