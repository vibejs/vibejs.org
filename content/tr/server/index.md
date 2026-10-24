# Sunucu

Bir vibe.js sunucusu modüllerden oluşan bir ağaçtır. Kök modül özellik modüllerini import eder. Her modül kendi provider'larını ve controller'larını listeler. Her controller da tek bir sözleşmeye (contract) hizmet eder. Sunucu Fetch API üzerine kurulu: uygulama aslında bir `fetch(Request): Promise<Response>` fonksiyonudur ve Node üzerinde de dinleyebilir.

## Uygulamanın yapısı {#application-layout}

```
contracts/src/todos.contract.ts     the contract shared with the UI
server/src/app.module.ts            AppModule and appOptions
server/src/main.ts                  creates the app and listens
server/src/todos/todos.module.ts    a feature module
server/src/todos/todos.controller.ts
server/src/todos/todos.service.ts
```

`server/src/app.module.ts` kök modülü ve uygulama seçeneklerini export eder. Dev sunucusu, araçlar ve testler bu dosyayı import eder. Bu yüzden dosyanın hiçbir yan etkisi yoktur:

```ts
@Module({ imports: [] })
export class AppModule {}

export const appOptions: AppOptions = { basePath: '/api' };
```

`server/src/main.ts` production giriş noktasıdır. Uygulamayı oluşturur, `SIGTERM` ve `SIGINT` gelince kapatır ve dinlemeye başlar:

```ts
const app = await VibeFactory.create(AppModule, appOptions);
app.enableShutdownHooks();
await app.listen(Number(process.env.PORT ?? 3000));
```

## Uygulamayı oluşturmak {#creating-the-application}

`VibeFactory.create(root, options)` modül grafiğini tarar, her provider'ı ve controller'ı oluşturur, sonra `onModuleInit` ve `onApplicationBootstrap` hook'larını çalıştırır. Dinlemeye başlamaz. Eksik bir provider ([VIBE9102](https://vibejs.org/v0/errors/VIBE9102)) ya da handler'ı olmayan bir rota ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303)) gibi bir grafik hatası varsa, daha tek bir istek bile karşılanmadan `create` reject eder.

Oluşan `App`:

| Üye                             | Ne yapar                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch(req)`                    | Tek bir isteği karşılar. Bağlı (bound) olduğu için düz bir fonksiyon olarak başka yere verebilirsin.                                                                                                          |
| `request(path, init?)`          | İsteği aynı process içinde gönderir. `init.json` bir JSON body ayarlar.                                                                                                                                       |
| `listen(port?, hostname?)`      | Uygulamayı Node üzerinde HTTP ile sunar. Port verilmezse 3000 olur.                                                                                                                                           |
| `enableShutdownHooks(signals?)` | Her sinyalde `close()` çağırır, sonra sinyali tekrar yükseltir.                                                                                                                                               |
| `close(signal?)`                | Yeni istekleri 503 ile reddeder, süren istekleri `shutdownTimeout` süresine kadar bekler, sunucuyu durdurur, sonra `onModuleDestroy` ve `onApplicationShutdown` çalıştırır. İki kere çağırmak sorun çıkarmaz. |
| `get(token)`                    | Script'ler ve testler için bir provider'ı okur.                                                                                                                                                               |
| `inspect()`                     | Araçlar için rotaları ve modülleri listeler.                                                                                                                                                                  |

`inspect(root, options)` aynı açıklamayı uygulamayı oluşturmadan döner. Hiçbir provider, controller, enhancer ya da hook çalışmaz. Yani araçlar ve testler grafiği güvenle okuyabilir.

```ts
const { routes, modules } = inspect(AppModule, { basePath: '/api' });
console.log(routes.map((r) => `${r.method} ${r.path} -> ${r.handler}`));
console.log(modules.map((m) => m.path));
```

## Deploy {#deploying}

`vibejs build` iki ayrı deploy edilebilir çıktı yazar:

- `ui/dist`: statik UI. Herhangi bir statik dosya sunucusu ya da CDN ile sunarsın.
- `server/dist/main.js`: sunucu. `node server/dist/main.js` ile çalıştırırsın. `PORT` değişkenini okur ve `/api` altında cevap verir.

`/api` isteklerini sunucuya, geri kalan her şeyi statik dosyalara yönlendir. Geliştirme sırasında `vibejs dev` ikisini tek bir port üzerinden sunar.

## Sonraki adımlar {#next}

- [Modüller ve provider'lar](https://vibejs.org/v0/server/modules)
- [Sözleşmeler](https://vibejs.org/v0/server/contracts)
- [Handler'lar](https://vibejs.org/v0/server/handlers)
- [Middleware, guard, interceptor ve filter'lar](https://vibejs.org/v0/server/pipeline)
- [Yapılandırma](https://vibejs.org/v0/server/configuration)
- [Test](https://vibejs.org/v0/server/testing)
