# Sunucu

Bir vibe.js sunucusu, modüllerden oluşan bir ağaçtır. Kök modül özellik modüllerini içe aktarır; her modül provider'larını ve controller'larını listeler; her controller tek bir contract'ı sunar. Sunucu Fetch API üzerine kuruludur: uygulama, Node üzerinde de dinleyebilen bir `fetch(Request): Promise<Response>` fonksiyonudur.

## Uygulama düzeni {#application-layout}

```
contracts/src/todos.contract.ts     the contract shared with the UI
server/src/app.module.ts            AppModule and appOptions
server/src/main.ts                  creates the app and listens
server/src/todos/todos.module.ts    a feature module
server/src/todos/todos.controller.ts
server/src/todos/todos.service.ts
```

`server/src/app.module.ts` kök modülü ve uygulama seçeneklerini dışa aktarır. Dev server, araçlar ve testler bu dosyayı içe aktarır; bu yüzden yan etkisi yoktur:

```ts
@Module({ imports: [] })
export class AppModule {}

export const appOptions: AppOptions = { basePath: '/api' };
```

`server/src/main.ts` production giriş noktasıdır. Uygulamayı oluşturur, `SIGTERM` ve `SIGINT` sinyallerinde kapatır ve dinler:

```ts
const app = await VibeFactory.create(AppModule, appOptions);
app.enableShutdownHooks();
await app.listen(Number(process.env.PORT ?? 3000));
```

## Uygulamayı oluşturmak {#creating-the-application}

`VibeFactory.create(root, options)` modül grafiğini tarar, her provider'ı ve controller'ı oluşturur, `onModuleInit` ve `onApplicationBootstrap` hook'larını çalıştırır. Dinlemez. Eksik bir provider ([VIBE9102](https://vibejs.org/v0/errors/VIBE9102)) ya da ele alınmamış bir route ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303)) gibi bir grafik hatası, hiçbir istek sunulmadan önce `create` çağrısını reddeder.

Oluşturulan `App`:

| Üye                             | Ne yapar                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch(req)`                    | Tek bir isteği işler. Bağlıdır (bound); bu yüzden düz bir fonksiyon olarak aktarılabilir.                                                                                                                     |
| `request(path, init?)`          | Süreç içinde bir istek gönderir; `init.json` bir JSON gövdesi ayarlar.                                                                                                                                        |
| `listen(port?, hostname?)`      | Uygulamayı Node üzerinde HTTP ile sunar; port varsayılan olarak 3000'dir.                                                                                                                                     |
| `enableShutdownHooks(signals?)` | Her sinyalde `close()` çağırır, ardından sinyali yeniden yükseltir.                                                                                                                                           |
| `close(signal?)`                | Yeni istekleri 503 ile reddeder, çalışanları `shutdownTimeout` süresine kadar bekler, sunucuyu durdurur ve `onModuleDestroy` ile `onApplicationShutdown` hook'larını çalıştırır. İki kez çağırmak güvenlidir. |
| `get(token)`                    | Betikler ve testler için bir provider okur.                                                                                                                                                                   |
| `inspect()`                     | Araçlar için route'ları ve modülleri listeler.                                                                                                                                                                |

`inspect(root, options)` uygulamayı oluşturmadan aynı açıklamayı döndürür: hiçbir provider, controller, enhancer ya da hook çalışmaz; böylece araçlar ve testler grafiği güvenle okuyabilir.

```ts
const { routes, modules } = inspect(AppModule, { basePath: '/api' });
console.log(routes.map((r) => `${r.method} ${r.path} -> ${r.handler}`));
console.log(modules.map((m) => m.path));
```

## Deploy etmek {#deploying}

`vibejs build` iki deploy edilebilir çıktı yazar:

- `ui/dist`: herhangi bir statik dosya sunucusu ya da CDN tarafından sunulan statik UI.
- `server/dist/main.js`: `node server/dist/main.js` ile çalıştırılan sunucu. `PORT` değerini okur ve `/api` altında yanıt verir.

`/api` yolunu sunucuya, geri kalan her şeyi statik dosyalara yönlendirin. Geliştirme sırasında `vibejs dev` ikisini de tek bir portta sunar.

## Sonraki adımlar {#next}

- [Modüller ve provider'lar](https://vibejs.org/v0/server/modules)
- [Contract'lar](https://vibejs.org/v0/server/contracts)
- [Handler'lar](https://vibejs.org/v0/server/handlers)
- [Middleware, guard, interceptor ve filter'lar](https://vibejs.org/v0/server/pipeline)
- [Yapılandırma](https://vibejs.org/v0/server/configuration)
- [Testler](https://vibejs.org/v0/server/testing)
