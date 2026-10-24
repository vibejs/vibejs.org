# Yapılandırma

## Ortam yapılandırması {#environment-config}

`defineConfig(schema)` bir class döner. Bu class'ın constructor'ı, isimleri schema anahtarlarından gelen ortam değişkenlerini doğrular. Onu her class gibi provide et ve gerektiği yerde inject et:

```ts
export class AppConfig extends defineConfig({
  DATABASE_URL: v.pipe(v.string(), v.url()),
  PORT: v.optional(v.pipe(v.string(), v.transform(Number)), '3000'),
}) {}

class Db {
  private readonly config = inject(AppConfig);

  url(): string {
    return this.config.DATABASE_URL;
  }
}

@Module({ global: true, providers: [AppConfig, Db], exports: [AppConfig, Db] })
export class CoreModule {}
```

Yapılandırma bir kere, uygulama oluşurken doğrulanır. Geçersiz olan bütün anahtarlar tek seferde [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) olarak raporlanır. Mesaj anahtarların ismini verir ama değerleri asla yazmaz. Schema'lar senkron olmalı ([VIBE9602](https://vibejs.org/v0/errors/VIBE9602)). Doğrulanan nesne dondurulur (frozen).

## Loglama {#logging}

Uygulamanın logger'ı her modülde `Logger` olarak provide edilir. Framework ile aynı hedefe log yazmak istiyorsan onu inject et:

```ts
class Mailer {
  private readonly log = inject(Logger);

  send(to: string): void {
    this.log.info('mail sent', { to });
  }
}
```

Varsayılan logger `JsonLogger` olur. Her kayıt için tek bir JSON satırı yazar: `{ time, level, msg, ...fields }`. Başka bir logger kullanmak istiyorsan onu `AppOptions.logger` içinde ver:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  logger: new JsonLogger({ level: 'debug', fields: { service: 'todo' } }),
};
```

Seviyeler şunlar: `debug`, `info` (varsayılan), `warn`, `error` ve `silent`. Her istek `debug` seviyesinde method, path, status ve süresiyle loglanır. Bir handler içindeki `ctx.log`, `requestId` değerini ekleyen bir alt logger'dır. Logları başka bir yere göndermek istiyorsan soyut `Logger` class'ını extend et ya da `JsonLogger` için `write` ver.

## CORS {#cors}

`cors(options)` bir middleware'dir. Preflight isteklerine cevap verir ve izin verilen origin'lere giden yanıtlara CORS header'larını ekler:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true, maxAge: 600 })],
};
```

`origin` değeri `'*'`, bir origin listesi ya da bir predicate olabilir. `'*'` ile `credentials: true` birlikte kullanılamaz ([VIBE9404](https://vibejs.org/v0/errors/VIBE9404)), çünkü tarayıcılar bu birleşimi yok sayar. UI ve API aynı origin'i paylaşıyorsa, ki varsayılan yapı böyledir, CORS'a hiç gerek yoktur.

## Cookie'ler {#cookies}

`ctx.cookies` isteğin cookie'lerini okur ve yanıta cookie yazar. Seçeneklerde aksini söylemezsen yeni cookie'ler `HttpOnly`, `Secure`, `SameSite=Lax` ve `Path=/` olur:

```ts
@Controller(session)
export class SessionController {
  @Handle(session.start)
  start(ctx: Ctx<typeof session.start>): void {
    ctx.cookies.set('session', crypto.randomUUID(), { maxAge: 60 * 60 * 24 });
  }

  @Handle(session.end)
  end(ctx: Ctx<typeof session.end>): void {
    ctx.cookies.delete('session');
  }
}
```

Cookie ismi bir RFC 9110 token'ı olmalı ([VIBE9504](https://vibejs.org/v0/errors/VIBE9504)).

## Limitler ve kapanış {#limits-and-shutdown}

| Seçenek             | Varsayılan | Anlamı                                                                                                         |
| ------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `basePath`          | `''`       | Her rotanın öneki, örneğin `/api` ([VIBE9405](https://vibejs.org/v0/errors/VIBE9405)).                         |
| `bodyLimit`         | 1 MiB      | Byte cinsinden en büyük istek body'si. Daha büyük body'ler 413 alır.                                           |
| `shutdownTimeout`   | 10 000 ms  | `close()` çağrısının süren istekleri ne kadar bekleyeceği ([VIBE9402](https://vibejs.org/v0/errors/VIBE9402)). |
| `validateResponses` | `true`     | Handler sonuçlarını doğrular. Bak: [Handler'lar](https://vibejs.org/v0/server/handlers#validation).            |

## TypeScript kurulumu {#typescript-setup}

Sunucu decorator'ları TypeScript'in legacy decorator'larıdır. Sunucunun `tsconfig.json` dosyası bunları açar:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

- `emitDecoratorMetadata` seçeneğini asla açma ve `reflect-metadata` paketini asla import etme. Bağımlılıkları tiplerden okumazsın, `inject()` ile tanımlarsın.
- `experimentalDecorators` kapalıysa decorator'lar, süsledikleri class tanımlanırken [VIBE9301](https://vibejs.org/v0/errors/VIBE9301) fırlatır.
- Vite ve Vitest decorator'ları Oxc ile derler. Oxc da yardımcı fonksiyonlarını `@oxc-project/runtime` paketinden import eder. Bu yardımcıların çözülebilmesi için `@oxc-project/runtime` paketini sunucu paketinin doğrudan bağımlılığı olarak tut.
