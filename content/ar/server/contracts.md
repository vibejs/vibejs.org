# العقود

يعرّف العقد مسارات مورد واحد: الطريقة، والمسار، والمدخلات، والاستجابة، والأخطاء. يقدّمه الخادم، وتستدعيه الواجهة، ويُتحقق من أنواع الطرفين على التعريف نفسه، دون أي توليد للكود.

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

ملفات العقود (`*.contract.ts`) لا تستورد إلا `@usevibejs/contract` ومكتبة مخططات، فتستطيع الواجهة استيرادها دون أن تجرّ معها كود الخادم.

## المسارات {#routes}

دوال المسارات هي `get` و`post` و`put` و`patch` و`del`. كل واحدة تأخذ مسارًا وتعريفًا اختياريًا:

| الحقل                    | المعنى                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `params`                 | مخطط لمعاملات المسار. دونه تكون نصوصًا.                                                               |
| `query`                  | مخطط لنص الاستعلام. المفتاح المكرّر في URL، أو المعرَّف نوعه مصفوفة، يكون مصفوفة.                        |
| `headers`                | مخطط لترويسات الطلب، بأسماء بأحرف صغيرة.                                                            |
| `body`                   | مخطط لجسم الطلب بصيغة JSON. غير مسموح في `get` ([VIBE9004](https://vibejs.org/v0/errors/VIBE9004)). |
| `response`               | مخطط لجسم النجاح بصيغة JSON، أو `raw()`. دونه يجيب المسار بـ 204.                                   |
| `status`                 | حالة النجاح: 200 (الافتراضي) أو 201 أو 202.                                                          |
| `errors`                 | رموز الأخطاء التي يرفعها المسار، ومع كل رمز حالة HTTP الخاصة به.                                     |
| `summary`، `description` | نص لمستند OpenAPI.                                                                                  |

المسار إما `/` وإما مقاطع مثل `/users/:id/posts`، وتبدأ المعاملات بـ `:` ([VIBE9001](https://vibejs.org/v0/errors/VIBE9001)). المسار الكامل للمسار هو بادئة العقد يليها مسار المسار نفسه، ويُضاف `basePath` الخاص بالتطبيق في أوله عند التقديم.

يعرّف `raw(contentType?)` استجابة تُرسل كما هي، مثل ملف. يعيد المعالج `Response` أو جسمًا مثل نص أو stream، ويستقبل العميل الـ `Response`:

```ts
export const reports = defineContract('/reports', {
  csv: get('/:year', { response: raw('text/csv') }),
});
```

## الأخطاء {#errors}

يعرّف المسار الأخطاء التي ينبغي أن يعالجها العميل بالصيغة `errors: { CODE: status }`. ويرفعها المعالج بـ `ctx.fail('CODE', detail?)`، فيستقبل العميل استجابة `application/problem+json`:

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

إلى جانب الرموز المعرَّفة، يستطيع كل مسار أن يجيب بالرموز المدمجة `BAD_REQUEST` و`VALIDATION_FAILED` و`INVALID_JSON` و`UNAUTHORIZED` و`FORBIDDEN` و`NOT_FOUND` و`METHOD_NOT_ALLOWED` و`BODY_TOO_LARGE` و`UNSUPPORTED_MEDIA_TYPE` و`INTERNAL_ERROR` و`SERVICE_UNAVAILABLE`. ومشكلة `VALIDATION_FAILED` تذكر كل خلل في `errors` بالصيغة `{ in, pointer, message }`.

## مكتبات المخططات {#schema-libraries}

تعمل أي مكتبة تدعم [Standard Schema](https://standardschema.dev)، ويمكن أن يخلط العقد الواحد بينها.

- **valibot** هي الخيار الافتراضي الموصى به للكود الذي يصل إلى المتصفح، لأن الحزمة النهائية لا تضم إلا أدوات التحقق التي تستخدمها.
- **zod** تعمل أيضًا. التواريخ تنتقل نصوصًا في JSON، فعرّفها بـ `z.iso.datetime()` لا بـ `z.date()`.

المخططات تعمل على الخادم. يتحقق الخادم من أجزاء الطلب قبل تشغيل المعالج، ويمرّر إليه ناتج المخطط، لذلك يقصّ `v.trim()` في مخطط الجسم المسافات على الخادم. أما العميل فيرسل مدخلاته ذات الأنواع بصيغة JSON دون التحقق منها، ويستمد نوع الاستجابة من المخطط دون أن يتحقق منها مرة أخرى.

## استدعاء العقد {#calling-a-contract}

تعيد `createClient(contracts, options)` دالة لكل مسار. لا يرمي الاستدعاء أبدًا عند فشل HTTP أو الشبكة، بل ينتهي إلى `ApiResult` تضيّق نوعه بفحص `ok`، ثم `error.code`:

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

- لكائن المدخلات `params` و`query` و`headers` و`body`، ونوع كل منها مأخوذ من المسار.
- يقبل الوسيط الثاني `{ signal, headers }`. ويمكن أن تكون `options.headers` دالة تُستدعى مع كل طلب، كدالة تضيف ترويسة التفويض.
- فشل الشبكة ينتهي إلى `code: 'NETWORK_ERROR'` و`status: 0`، والإلغاء إلى `ABORTED`. والاستجابة الفاشلة التي ليست problem، أو الجسم الذي ليس JSON، تنتهي إلى `UNEXPECTED_RESPONSE`.
- تمرّر الاختبارات `fetch: app.fetch` لتستدعي التطبيق داخل العملية نفسها؛ انظر [الاختبار](https://vibejs.org/v0/server/testing).

## OpenAPI {#openapi}

تعيد `generateOpenApi(contracts, options)` من `@usevibejs/server/openapi` مستند OpenAPI 3.1 لسجلّ العقود نفسه الذي يأخذه العميل. قدّمه عبر middleware. يرى الـ middleware المسار الكامل للطلب، بما فيه المسار الأساسي، لذلك تجيب الوصفة التالية عن `/api/openapi.json` تحت المسار الأساسي `/api`:

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

يُحوَّل كل مخطط بمحوِّل Standard JSON Schema الخاص به. مخططات zod تحمل محوِّلها. أما مخططات valibot فغلّفها بـ `toStandardJsonSchema()` من `@valibot/to-json-schema`، أو مرّر بديلًا `toJsonSchema(schema, io)`. المخطط الذي لا يمكن تحويله يرمي [VIBE9801](https://vibejs.org/v0/errors/VIBE9801)، ومخططان مختلفان باسم واحد يرميان [VIBE9802](https://vibejs.org/v0/errors/VIBE9802)، وحالة خطأ خارج النطاق 400–599 ترمي [VIBE9803](https://vibejs.org/v0/errors/VIBE9803).
