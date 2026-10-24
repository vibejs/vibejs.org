# Controller'lar ve handler'lar

Controller tek bir contract'ı sunar. Contract'ın her route'unun, `@Handle(route)` ile işaretlenmiş tam olarak bir handler metodu vardır:

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

Controller'ı bir modülün `controllers` listesine kaydedin. Uygulama başlangıçta şunları denetler: her route'un bir handler'ı olması ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303), [VIBE9304](https://vibejs.org/v0/errors/VIBE9304)), her handler'ın controller'ın contract'ına ait olması ([VIBE9305](https://vibejs.org/v0/errors/VIBE9305)) ve her contract'ın bir controller'ı olması ([VIBE9306](https://vibejs.org/v0/errors/VIBE9306)).

## Context {#the-context}

Bir handler tek bir argüman alır: `ctx: Ctx<typeof contract.route>`:

| Alan                                 | Değer                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `params`, `query`, `headers`, `body` | Doğrulanmış istek parçaları; her biri yalnızca route bildirdiğinde bulunur (params her zaman).            |
| `fail(code, detail?)`                | İsteği route'un bildirilmiş bir hata koduyla sonlandırır.                                                 |
| `req`, `url`                         | `Request` ve ayrıştırılmış URL'si.                                                                        |
| `requestId`                          | `x-request-id` başlığı ya da üretilmiş bir id; yanıtta geri gönderilir.                                   |
| `log`                                | `requestId` eklenmiş uygulama logger'ı.                                                                   |
| `cookies`                            | `get`, `set` ve `delete`; bkz. [Yapılandırma](https://vibejs.org/v0/server/configuration#cookies).        |
| `responseHeaders`                    | Yanıta eklenen başlıklar.                                                                                 |
| `signal`                             | İstemci bağlantıyı kestiğinde iptal edilir.                                                               |
| `state`                              | Guard'ların ve interceptor'ların handler ile paylaştığı değerler.                                         |
| `getMetadata(key)`                   | `createMetadata` ile ayarlanan metadata; bkz. [Pipeline](https://vibejs.org/v0/server/pipeline#metadata). |

Bir handler async olabilir. Route'un yanıt türünü döndürür: JSON yanıt için şemanın girdi türünü, yanıtı olmayan bir route için hiçbir şeyi, bir `raw()` route için ise bir `Response` ya da gövde. Herhangi bir handler'dan `Response` döndürmek onu olduğu gibi gönderir.

## Hatalar {#errors}

- **Bildirilmiş hatalar.** `ctx.fail('CODE', detail?)`, contract'ın bildirdiği durumla bir `HttpError` fırlatır. Kodlar tiplidir: yalnızca route'un bildirdiği kodlar kabul edilir.
- **Diğer istemci hataları.** Bir handler, guard, interceptor ya da servisten `throw new HttpError(status, code, detail?)`. Bildirilmiş bir kodu ya da `NOT_FOUND` gibi yerleşik birini tercih edin; bildirilmemiş bir kod yine de gönderilir, ancak [VIBE9502](https://vibejs.org/v0/errors/VIBE9502) uyarısıyla.
- **Hatalar (bug).** Diğer her hata nedeniyle birlikte loglanır ([VIBE9503](https://vibejs.org/v0/errors/VIBE9503)) ve ayrıntı vermeden 500 `INTERNAL_ERROR` ile yanıtlanır.

Her hata yanıtı `application/problem+json` biçimindedir: `{ type, title, status, code, detail?, errors?, requestId }`.

```ts
export function requireUser(id: string | undefined): string {
  if (!id) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in first');
  return id;
}
```

## Doğrulama {#validation}

Handler çalışmadan önce uygulama `params`, `query`, `headers` ve `body` değerlerini route'un şemalarına karşı doğrular ve şema çıktısını `ctx` üzerine koyar. Herhangi bir parça başarısız olursa istemci, her sorunu `errors` içinde taşıyan 400 `VALIDATION_FAILED` alır ve handler çalışmaz. JSON olmayan bir gövde 400 `INVALID_JSON`, `bodyLimit` değerini aşan bir gövde 413 `BODY_TOO_LARGE` olur.

`validateResponses` ile (varsayılan olarak açık), handler'ın sonucu yanıt şemasına karşı doğrulanır ve şema çıktısı gönderilir. Uyumsuzluk bir sunucu hatasıdır (bug): [VIBE9501](https://vibejs.org/v0/errors/VIBE9501) olarak loglanır ve 500 ile yanıtlanır.

Şema çıktısının gönderilmesi, istemciye hangi anahtarların ulaşacağına şemanın karar vermesi demektir:

- valibot `v.object()` ve zod `z.object()`, şemanın bildirmediği anahtarları atar; bu yüzden `passwordHash` gibi dahili bir alan gönderilmez.
- arktype, tür `"+": "delete"` ayarlamadıkça bildirilmemiş anahtarları korur.
- `validateResponses: false` ile sonuç değiştirilmeden gönderilir.

Saklanan veri döndüren her route için açık bir yanıt şeması bildirin ve `validateResponses` ayarını açık tutun.

## @Handle üzerinde TS1241 {#ts1241-on-handle}

Bir `@Handle(...)` satırındaki `TS1241: Unable to resolve signature of method decorator when called as an expression` hatası, metodun route ile uyuşmadığı anlamına gelir. `vibejs check` bunu şu çözümle raporlar:

> the handler must be `(ctx: Ctx<typeof contract.route>)` and return the route response type; do not cast or use `any`

Şu sırayla kontrol edin:

1. Parametre, `@Handle` içinde adı geçen aynı route için `ctx: Ctx<typeof contract.route>` olmalıdır; ya da metodun parametresi olmamalıdır.
2. Dönüş türü yanıt türüdür: döndürülen nesnedeki eksik bir alan ya da yanlış bir tür olağan nedendir. Hatadaki tam alanı görmek için metoda açık bir dönüş türü ekleyin.
3. `response` olmayan bir route `void` döndürür.

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

Çözüm, dönüş türü `{ id: string }` iken `{ id: ctx.params.id }` döndürmektir. Hatayı asla bir cast ya da `any` ile susturmayın: handler ile istemciyi senkron tutan şey decorator'dır.
