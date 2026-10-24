# Contract'lar

Contract, tek bir kaynağın route'larını bildirir: metot, yol, girdiler, yanıt ve hatalar. Sunucu onu sunar, UI onu çağırır ve ikisi de kod üretimi olmadan aynı bildirime karşı tür denetiminden geçer.

```ts
import { defineContract, del, get, patch, post } from '@usevibejs/contract';
import * as v from 'valibot';

export const Todo = v.object({ id: v.string(), title: v.string(), done: v.boolean() });

export const todos = defineContract('/todos', {
  list: get('/', { query: v.object({ done: v.optional(v.string()) }), response: v.array(Todo) }),
  create: post('/', {
    body: v.object({ title: v.pipe(v.string(), v.trim(), v.minLength(1)) }),
    response: Todo,
    status: 201,
  }),
  toggle: patch('/:id', { response: Todo, errors: { TODO_NOT_FOUND: 404 } }),
  remove: del('/:id', { errors: { TODO_NOT_FOUND: 404 } }),
});
```

Contract dosyaları (`*.contract.ts`) yalnızca `@usevibejs/contract` ve bir şema kütüphanesini içe aktarır; böylece UI, sunucu kodunu çekmeden bunları içe aktarabilir.

## Route'lar {#routes}

Route yardımcıları `get`, `post`, `put`, `patch` ve `del` fonksiyonlarıdır. Her biri bir yol ve isteğe bağlı bir tanım alır:

| Alan                     | Anlamı                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `params`                 | Yol parametreleri için şema; yoksa parametreler string olur.                                                   |
| `query`                  | Query string için şema. URL'de tekrarlanan ya da dizi olarak tiplenen bir anahtar dizi olur.                   |
| `headers`                | İstek başlıkları için şema; adlar küçük harflidir.                                                             |
| `body`                   | JSON istek gövdesi için şema; `get` üzerinde kullanılamaz ([VIBE9004](https://vibejs.org/v0/errors/VIBE9004)). |
| `response`               | JSON başarı gövdesi için şema ya da `raw()`. Yoksa route 204 ile yanıtlar.                                     |
| `status`                 | Başarı durumu: 200 (varsayılan), 201 veya 202.                                                                 |
| `errors`                 | Route'un ürettiği hata kodları, her biri HTTP durumuyla birlikte.                                              |
| `summary`, `description` | OpenAPI dokümanı için metin.                                                                                   |

Yollar `/` ya da `/users/:id/posts` gibi segmentlerdir; parametreler `:` ile başlar ([VIBE9001](https://vibejs.org/v0/errors/VIBE9001)). Bir route'un tam yolu, contract önekini route yolunun izlemesidir; uygulamanın `basePath` değeri de sunulurken başa eklenir.

`raw(contentType?)`, bir dosya gibi olduğu gibi gönderilen bir yanıtı bildirir. Handler bir `Response` ya da string veya stream gibi bir gövde döndürür ve istemci `Response` nesnesini alır:

```ts
export const reports = defineContract('/reports', {
  csv: get('/:year', { response: raw('text/csv') }),
});
```

## Hatalar {#errors}

Bir route, istemcinin ele alması gereken hataları `errors: { CODE: status }` olarak bildirir. Handler bunları `ctx.fail('CODE', detail?)` ile üretir ve istemci bir `application/problem+json` yanıtı alır:

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "code": "TODO_NOT_FOUND",
  "detail": "No todo 7",
  "requestId": "9a7c..."
}
```

Bildirilen kodların yanında, her route yerleşik şu kodlarla yanıt verebilir: `BAD_REQUEST`, `VALIDATION_FAILED`, `INVALID_JSON`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `BODY_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `INTERNAL_ERROR` ve `SERVICE_UNAVAILABLE`. Bir `VALIDATION_FAILED` problem'i her sorunu `errors` içinde `{ in, pointer, message }` olarak listeler.

## Şema kütüphaneleri {#schema-libraries}

Her [Standard Schema](https://standardschema.dev) kütüphanesi çalışır ve bir contract bunları karıştırabilir.

- **valibot**, tarayıcıya gönderilen kod için önerilen varsayılandır; çünkü pakete yalnızca kullandığınız doğrulayıcılar girer.
- **zod** da çalışır. Tarihler JSON'da string olarak taşınır; bu yüzden onları `z.date()` yerine `z.iso.datetime()` ile bildirin.

Şemalar sunucuda çalışır. Sunucu, handler çalışmadan önce istek parçalarını doğrular ve şema çıktısını handler'a verir; dolayısıyla bir gövde şemasındaki `v.trim()` sunucuda kırpar. İstemci tipli girdisini doğrulamadan JSON olarak gönderir ve yanıtı şemadan tipler, tekrar doğrulamaz.

## Contract'ı çağırmak {#calling-a-contract}

`createClient(contracts, options)`, route başına bir fonksiyon döndürür. Bir çağrı HTTP ya da ağ hataları için asla hata fırlatmaz; önce `ok` üzerinden, sonra `error.code` üzerinden daralttığınız bir `ApiResult` ile çözülür:

```ts
const api = createClient({ todos }, { baseUrl: '/api' });

const result = await api.todos.one({ params: { id: '7' } });
if (result.ok) {
  console.log(result.data.title);
} else if (result.error.code === 'TODO_NOT_FOUND') {
  const status: 404 = result.error.status;
  console.log(status, result.error.detail);
} else {
  console.log(result.error.code, result.error.status);
}
```

- Girdi nesnesinde `params`, `query`, `headers` ve `body` bulunur; her biri route'tan tiplenir.
- İkinci argüman `{ signal, headers }` alır. `options.headers` bir fonksiyon olabilir ve her istek için çağrılır; örneğin bir authorization başlığı ekleyen fonksiyon.
- Ağ hatası `code: 'NETWORK_ERROR'` ve `status: 0` ile, iptal `ABORTED` ile, problem olmayan başarısız bir yanıt ya da JSON olmayan bir gövde ise `UNEXPECTED_RESPONSE` ile çözülür.
- Testler, bir uygulamayı süreç içinde çağırmak için `fetch: app.fetch` verir; bkz. [Testler](https://vibejs.org/v0/server/testing).

## OpenAPI {#openapi}

`@usevibejs/server/openapi` içindeki `generateOpenApi(contracts, options)`, istemcinin aldığı contract kaydı için bir OpenAPI 3.1 dokümanı döndürür. Onu bir middleware ile sunun. Middleware tam istek yolunu, base path dahil görür; bu yüzden aşağıdaki tarif, `/api` base path'i altında `/api/openapi.json` adresini yanıtlar:

```ts
const doc = generateOpenApi(
  { todos },
  { info: { title: 'Todo API', version: '1.0.0' }, servers: [{ url: '/api' }] },
);

export const openapi: Middleware = (req, next) =>
  new URL(req.url).pathname.endsWith('/openapi.json')
    ? Promise.resolve(Response.json(doc))
    : next();
```

Her şema kendi Standard JSON Schema dönüştürücüsüyle dönüştürülür. zod şemaları bir dönüştürücü taşır; valibot şemalarını `@valibot/to-json-schema` içindeki `toStandardJsonSchema()` ile sarın ya da yedek olarak bir `toJsonSchema(schema, io)` verin. Dönüştürülemeyen bir şema [VIBE9801](https://vibejs.org/v0/errors/VIBE9801), aynı adı taşıyan iki farklı şema [VIBE9802](https://vibejs.org/v0/errors/VIBE9802), 400–599 dışındaki bir hata durumu ise [VIBE9803](https://vibejs.org/v0/errors/VIBE9803) hatası fırlatır.
