# Yapılandırma

## Ortam yapılandırması {#environment-config}

`defineConfig(schema)`, constructor'ı şema anahtarlarının adlandırdığı ortam değişkenlerini doğrulayan bir sınıf döndürür. Onu diğer sınıflar gibi sağlayın ve gerektiği yerde enjekte edin:

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

Yapılandırma, uygulama oluşturulurken bir kez doğrulanır. Başarısız olan her anahtar tek seferde [VIBE9601](https://vibejs.org/v0/errors/VIBE9601) olarak bildirilir; mesaj anahtarları adlandırır ve değerleri asla yazdırmaz. Şemalar eşzamanlı olmalıdır ([VIBE9602](https://vibejs.org/v0/errors/VIBE9602)). Doğrulanmış nesne dondurulur (frozen).

## Loglama {#logging}

Uygulama logger'ı her modülde `Logger` olarak sağlanır. Framework ile aynı çıkışa log yazmak için onu enjekte edin:

```ts
class Mailer {
  private readonly log = inject(Logger);

  send(to: string): void {
    this.log.info('mail sent', { to });
  }
}
```

Varsayılan logger, her kayıt için bir JSON satırı yazan `JsonLogger`'dır: `{ time, level, msg, ...fields }`. Başka birini `AppOptions.logger` içinde verin:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  logger: new JsonLogger({ level: 'debug', fields: { service: 'todo' } }),
};
```

Seviyeler `debug`, `info` (varsayılan), `warn`, `error` ve `silent` değerleridir. Her istek `debug` seviyesinde metodu, yolu, durumu ve süresiyle loglanır. Bir handler'daki `ctx.log`, `requestId` ekleyen bir alt logger'dır. Logları başka bir yere göndermek için soyut `Logger` sınıfını genişletin ya da `JsonLogger`'a `write` verin.

## CORS {#cors}

`cors(options)` bir middleware'dir. Preflight isteklerini yanıtlar ve izin verilen origin'lere giden yanıtlara CORS başlıklarını ekler:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true, maxAge: 600 })],
};
```

`origin`; `'*'`, bir origin listesi ya da bir predicate'tir. `'*'` değerinin `credentials: true` ile birlikte kullanılması reddedilir ([VIBE9404](https://vibejs.org/v0/errors/VIBE9404)), çünkü tarayıcılar bunu yok sayar. UI ve API aynı origin'i paylaştığında, ki varsayılan düzen budur, CORS gerekmez.

## Cookie'ler {#cookies}

`ctx.cookies` istek cookie'lerini okur ve yanıt cookie'lerini ayarlar. Seçenekler aksini söylemedikçe yeni cookie'ler `HttpOnly`, `Secure`, `SameSite=Lax` ve `Path=/` olur:

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

Cookie adı bir RFC 9110 token'ı olmalıdır ([VIBE9504](https://vibejs.org/v0/errors/VIBE9504)).

## Limitler ve kapatma {#limits-and-shutdown}

| Seçenek             | Varsayılan | Anlamı                                                                                                              |
| ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `basePath`          | `''`       | Her route'un öneki; örneğin `/api` ([VIBE9405](https://vibejs.org/v0/errors/VIBE9405)).                             |
| `bodyLimit`         | 1 MiB      | Bayt cinsinden en büyük istek gövdesi; daha büyük gövdeler 413 alır.                                                |
| `shutdownTimeout`   | 10 000 ms  | `close()` fonksiyonunun çalışan istekleri ne kadar bekleyeceği ([VIBE9402](https://vibejs.org/v0/errors/VIBE9402)). |
| `validateResponses` | `true`     | Handler sonuçlarını doğrular; bkz. [Handler'lar](https://vibejs.org/v0/server/handlers#validation).                 |

## TypeScript kurulumu {#typescript-setup}

Sunucu decorator'ları TypeScript legacy decorator'larıdır. Sunucunun `tsconfig.json` dosyası bunları etkinleştirir:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

- `emitDecoratorMetadata` ayarını asla etkinleştirmeyin ve `reflect-metadata` paketini asla içe aktarmayın: bağımlılıklar türlerden okunmaz, `inject()` ile bildirilir.
- `experimentalDecorators` olmadan, decorator'lar dekore edilen sınıf tanımlandığında [VIBE9301](https://vibejs.org/v0/errors/VIBE9301) hatası fırlatır.
- Vite ve Vitest decorator'ları, yardımcı fonksiyonlarını `@oxc-project/runtime` paketinden içe aktaran Oxc ile derler. Yardımcıların çözümlenebilmesi için `@oxc-project/runtime` paketini sunucu paketinin doğrudan bağımlılığı olarak tutun.
