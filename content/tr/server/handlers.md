# Controller'lar ve handler'lar

Bir controller tek bir sözleşmeye hizmet eder. Sözleşmedeki her rotanın, `@Handle(route)` ile işaretlenmiş tam olarak bir handler method'u olur:

```ts
@Controller(todos)
export class TodosController {
  private readonly todos = inject(TodosService);

  @Handle(todos.list)
  list(): Todo[] {
    return this.todos.list();
  }

  @Handle(todos.create)
  create(ctx: Ctx<typeof todos.create>): Todo {
    return this.todos.create(ctx.body.title);
  }

  @Handle(todos.remove)
  remove(ctx: Ctx<typeof todos.remove>): void {
    if (!this.todos.remove(ctx.params.id)) ctx.fail('TODO_NOT_FOUND', `No todo ${ctx.params.id}`);
  }
}
```

Controller'ı bir modülün `controllers` listesine kaydet. Uygulama açılırken şunları kontrol eder: her rotanın tek bir handler'ı var mı ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303), [VIBE9304](https://vibejs.org/v0/errors/VIBE9304)), her handler controller'ın sözleşmesine mi ait ([VIBE9305](https://vibejs.org/v0/errors/VIBE9305)) ve her sözleşmenin tek bir controller'ı var mı ([VIBE9306](https://vibejs.org/v0/errors/VIBE9306)).

## Context {#the-context}

Handler tek bir argüman alır: `ctx: Ctx<typeof contract.route>`.

| Alan                                 | Değer                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `params`, `query`, `headers`, `body` | İsteğin doğrulanmış parçaları. Her biri sadece rota onu tanımlıyorsa vardır (params her zaman vardır).    |
| `fail(code, detail?)`                | İsteği, rotanın tanımladığı bir hata koduyla bitirir.                                                     |
| `req`, `url`                         | `Request` ve onun parse edilmiş URL'si.                                                                   |
| `requestId`                          | `x-request-id` header'ı ya da üretilen bir id. Yanıtta geri gönderilir.                                   |
| `log`                                | `requestId` eklenmiş uygulama logger'ı.                                                                   |
| `cookies`                            | `get`, `set` ve `delete`. Bak: [Yapılandırma](https://vibejs.org/v0/server/configuration#cookies).        |
| `responseHeaders`                    | Yanıta eklenen header'lar.                                                                                |
| `signal`                             | İstemci bağlantıyı kesince iptal olur.                                                                    |
| `state`                              | Guard'ların ve interceptor'ların handler ile paylaştığı değerler.                                         |
| `getMetadata(key)`                   | `createMetadata` ile ayarlanan metadata. Bak: [Pipeline](https://vibejs.org/v0/server/pipeline#metadata). |

Handler async olabilir. Rotanın yanıt tipini döner: JSON yanıt için schema'nın input tipini, yanıtı olmayan bir rota için hiçbir şey, `raw()` rotası için de bir `Response` ya da bir body. Herhangi bir handler'dan `Response` dönersen olduğu gibi gönderilir.

## Hatalar {#errors}

- **Tanımlı hatalar.** `ctx.fail('CODE', detail?)`, sözleşmenin tanımladığı durumla bir `HttpError` fırlatır. Kodlar tiplidir: sadece rotanın tanımladığı kodları kabul eder.
- **Diğer istemci hataları.** Bir handler, guard, interceptor ya da servis içinden `throw new HttpError(status, code, detail?)` yaz. Tanımlı bir kodu ya da `NOT_FOUND` gibi yerleşik bir kodu tercih et. Tanımsız bir kod da gönderilir, ama [VIBE9502](https://vibejs.org/v0/errors/VIBE9502) uyarısıyla.
- **Bug'lar.** Uygulama diğer her hatayı sebebiyle beraber loglar ([VIBE9503](https://vibejs.org/v0/errors/VIBE9503)) ve ayrıntı vermeden 500 `INTERNAL_ERROR` döner.

Her hata yanıtı `application/problem+json` olur: `{ type, title, status, code, detail?, errors?, requestId }`.

```ts
export function requireUser(id: string | undefined): string {
  if (!id) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in first');
  return id;
}
```

## Doğrulama {#validation}

Handler çalışmadan önce uygulama `params`, `query`, `headers` ve `body` değerlerini rotanın schema'larına göre doğrular ve schema çıktısını `ctx` üzerine koyar. Herhangi bir parça geçersizse istemci, her sorunu `errors` içinde listeleyen 400 `VALIDATION_FAILED` alır ve handler hiç çalışmaz. JSON olmayan bir body 400 `INVALID_JSON` alır. `bodyLimit` sınırını aşan bir body de 413 `BODY_TOO_LARGE` alır.

`validateResponses` açıksa (varsayılan olarak açık), handler'ın sonucu yanıt schema'sına göre doğrulanır ve schema çıktısı gönderilir. Uyuşmazlık bir sunucu bug'ıdır: [VIBE9501](https://vibejs.org/v0/errors/VIBE9501) olarak loglanır ve 500 ile cevaplanır.

Schema çıktısını göndermek, istemciye hangi anahtarların gideceğine schema'nın karar vermesi demek:

- valibot `v.object()` ve zod `z.object()` schema'da tanımlı olmayan anahtarları atar. Yani `passwordHash` gibi iç bir alan gönderilmez.
- arktype, tip `"+": "delete"` ayarlamadıkça tanımsız anahtarları tutar.
- `validateResponses: false` verirsen sonuç hiç değişmeden gönderilir.

Kayıtlı veri dönen her rota için açık bir yanıt schema'sı tanımla ve `validateResponses` seçeneğini açık tut.

## @Handle üzerinde TS1241 {#ts1241-on-handle}

Bir `@Handle(...)` satırında `TS1241: Unable to resolve signature of method decorator when called as an expression` görüyorsan, method rotayla uyuşmuyor demektir. `vibejs check` bunu şu düzeltmeyle raporlar:

> the handler must be `(ctx: Ctx<typeof contract.route>)` and return the route response type; do not cast or use `any`

Şu sırayla kontrol et:

1. Parametre, `@Handle` ile verdiğin rotanın aynısı için `ctx: Ctx<typeof contract.route>` mi, ya da method'un hiç parametresi yok mu?
2. Dönüş tipi yanıt tipi mi? Genelde sebep, dönen nesnede eksik bir alan ya da yanlış bir tiptir. Hatada tam olarak hangi alanın sorunlu olduğunu görmek için method'a açık bir dönüş tipi yaz.
3. `response` tanımı olmayan bir rota `void` döner.

```ts
@Controller(users)
export class UsersController {
  // @ts-expect-error -- TS1241: `id` must be a string
  @Handle(users.one)
  one(ctx: Ctx<typeof users.one>): { id: number } {
    return { id: Number(ctx.params.id) };
  }
}
```

Düzeltme, `{ id: string }` dönüş tipiyle `{ id: ctx.params.id }` dönmek. Hatayı asla bir cast ya da `any` ile susturma. Handler'ı ve istemciyi senkron tutan şey tam olarak bu decorator.
