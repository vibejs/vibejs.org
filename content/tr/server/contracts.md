# Sözleşmeler

Sözleşme (contract), tek bir kaynağın rotalarını tanımlar: method, path, girdiler, yanıt ve hatalar. Sunucu sözleşmeyi sunar, UI onu çağırır. İkisi de aynı tanıma göre tip denetiminden geçer ve arada hiç kod üretimi yoktur.

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

Sözleşme dosyaları (`*.contract.ts`) sadece `@usevibejs/contract` ve bir schema kütüphanesi import eder. Böylece UI bu dosyaları import ettiğinde sunucu kodunu da beraberinde çekmez.

## Rotalar {#routes}

Rota yardımcıları şunlar: `get`, `post`, `put`, `patch` ve `del`. Her biri bir path ve isteğe bağlı bir tanım alır:

| Alan                     | Anlamı                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `params`                 | Path parametreleri için bir schema. Vermezsen parametreler string olur.                                               |
| `query`                  | Query string için bir schema. URL'de tekrarlanan ya da dizi olarak tiplenen bir anahtar dizi olur.                    |
| `headers`                | İstek header'ları için küçük harfli isimlerle bir schema.                                                             |
| `body`                   | JSON istek body'si için bir schema. `get` üzerinde kullanamazsın ([VIBE9004](https://vibejs.org/v0/errors/VIBE9004)). |
| `response`               | Başarılı JSON body için bir schema ya da `raw()`. Vermezsen rota 204 döner.                                           |
| `status`                 | Başarı durumu: 200 (varsayılan), 201 ya da 202.                                                                       |
| `errors`                 | Rotanın fırlattığı hata kodları, her biri kendi HTTP durumuyla.                                                       |
| `summary`, `description` | OpenAPI belgesi için metin.                                                                                           |

Path'ler ya `/` olur ya da `/users/:id/posts` gibi segmentlerden oluşur. Parametreler `:` ile başlar ([VIBE9001](https://vibejs.org/v0/errors/VIBE9001)). Bir rotanın tam path'i, sözleşme önekinin ardından gelen rota path'idir. Rota sunulurken başına uygulamanın `basePath` değeri de eklenir.

`raw(contentType?)`, dosya gibi olduğu gibi gönderilen bir yanıt tanımlar. Handler bir `Response` ya da string veya stream gibi bir body döner. İstemciye de `Response` gelir:

```ts
export const reports = defineContract('/reports', {
  csv: get('/:year', { response: raw('text/csv') }),
});
```

## Hatalar {#errors}

Bir rota, istemcinin ele alması gereken hataları `errors: { CODE: status }` şeklinde tanımlar. Handler bunları `ctx.fail('CODE', detail?)` ile fırlatır, istemci de bir `application/problem+json` yanıtı alır:

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

Tanımladığın kodların yanında her rota şu yerleşik kodlarla da cevap verebilir: `BAD_REQUEST`, `VALIDATION_FAILED`, `INVALID_JSON`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `BODY_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `INTERNAL_ERROR` ve `SERVICE_UNAVAILABLE`. Bir `VALIDATION_FAILED` problemi, her sorunu `errors` içinde `{ in, pointer, message }` olarak listeler.

## Schema kütüphaneleri {#schema-libraries}

Herhangi bir [Standard Schema](https://standardschema.dev) kütüphanesi çalışır, tek bir sözleşmede birkaç tanesini karıştırabilirsin bile.

- **valibot**, tarayıcıya giden kod için önerilen varsayılandır. Çünkü bundle'a sadece kullandığın doğrulayıcılar girer.
- **zod** da çalışır. JSON'da tarihler string olarak taşınır, bu yüzden onları `z.date()` yerine `z.iso.datetime()` ile tanımla.

Schema'lar sunucuda çalışır. Sunucu, handler çalışmadan önce isteğin parçalarını doğrular ve schema çıktısını handler'a verir. Yani body schema'sındaki `v.trim()` kırpma işini sunucuda yapar. İstemci tipli girdisini doğrulamadan JSON olarak gönderir. Yanıtın tipini de schema'dan alır, ama yanıtı bir daha doğrulamaz.

## Bir sözleşmeyi çağırmak {#calling-a-contract}

`createClient(contracts, options)` her rota için bir fonksiyon döner. Bir çağrı HTTP ya da ağ hataları yüzünden asla hata fırlatmaz. Her zaman bir `ApiResult` ile resolve olur. Sen de onu önce `ok`, sonra `error.code` üzerinden daraltırsın:

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

- Girdi nesnesinde `params`, `query`, `headers` ve `body` bulunur. Her birinin tipi rotadan gelir.
- İkinci argüman `{ signal, headers }` alır. `options.headers` bir fonksiyon da olabilir. Bu fonksiyon her istekte çağrılır, örneğin bir authorization header'ı eklemek için.
- Ağ hatası `code: 'NETWORK_ERROR'` ve `status: 0` ile resolve olur. İptal `ABORTED` ile resolve olur. Problem olmayan başarısız bir yanıt ya da JSON olmayan bir body de `UNEXPECTED_RESPONSE` ile resolve olur.
- Testler, bir uygulamayı aynı process içinde çağırmak için `fetch: app.fetch` verir. Bak: [Test](https://vibejs.org/v0/server/testing).

## OpenAPI {#openapi}

`@usevibejs/server/openapi` içindeki `generateOpenApi(contracts, options)`, istemcinin aldığı sözleşme kaydının aynısı için bir OpenAPI 3.1 belgesi döner. Bunu bir middleware ile sun. Middleware, base path dahil isteğin tam path'ini görür. Bu yüzden aşağıdaki tarif `/api` base path'i altında `/api/openapi.json` adresine cevap verir:

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

Her schema kendi Standard JSON Schema dönüştürücüsüyle çevrilir. zod schema'larında bu dönüştürücü zaten var. valibot schema'larını `@valibot/to-json-schema` içindeki `toStandardJsonSchema()` ile sarmala ya da yedek olarak bir `toJsonSchema(schema, io)` ver. Çevrilemeyen bir schema [VIBE9801](https://vibejs.org/v0/errors/VIBE9801) fırlatır. Aynı ismi taşıyan iki farklı schema [VIBE9802](https://vibejs.org/v0/errors/VIBE9802) fırlatır. 400–599 aralığının dışındaki bir hata durumu da [VIBE9803](https://vibejs.org/v0/errors/VIBE9803) fırlatır.
