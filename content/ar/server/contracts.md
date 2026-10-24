# العقود

يصرّح العقد (contract) بمسارات مورد واحد: الطريقة والمسار والمدخلات والاستجابة والأخطاء. يقدّمه الخادم، وتستدعيه الواجهة، ويُفحص كلاهما نوعيًا مقابل التصريح نفسه، دون توليد شيفرة.

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

ملفات العقود (`*.contract.ts`) لا تستورد سوى `@usevibejs/contract` ومكتبة مخططات، ولذلك تستطيع الواجهة استيرادها دون جلب شيفرة الخادم.

## المسارات {#routes}

دوال المساعدة للمسارات هي `get` و`post` و`put` و`patch` و`del`. تأخذ كلٌّ منها مسارًا وتعريفًا اختياريًا:

| الحقل                    | المعنى                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `params`                 | مخطط لمعاملات المسار؛ وبدونه تكون سلاسل نصية.                                                          |
| `query`                  | مخطط لسلسلة الاستعلام. المفتاح المكرر في URL، أو المُنمَّط كمصفوفة، يكون مصفوفة.                          |
| `headers`                | مخطط لترويسات الطلب، بأسماء بأحرف صغيرة.                                                             |
| `body`                   | مخطط لجسم الطلب بصيغة JSON؛ غير مسموح على `get` ([VIBE9004](https://vibejs.org/v0/errors/VIBE9004)). |
| `response`               | مخطط لجسم النجاح بصيغة JSON، أو `raw()`. وبدونه يجيب المسار بالحالة 204.                             |
| `status`                 | حالة النجاح: 200 (الافتراضي) أو 201 أو 202.                                                           |
| `errors`                 | رموز الأخطاء التي يطلقها المسار، لكلٍّ منها حالة HTTP الخاصة به.                                        |
| `summary`, `description` | نص لمستند OpenAPI.                                                                                   |

المسارات هي `/` أو مقاطع مثل `/users/:id/posts`؛ وتبدأ المعاملات بـ `:` ([VIBE9001](https://vibejs.org/v0/errors/VIBE9001)). المسار الكامل لمسار ما هو بادئة العقد متبوعة بمسار المسار، ويُسبق بـ `basePath` الخاص بالتطبيق عند تقديمه.

تصرّح `raw(contentType?)` باستجابة تُرسل كما هي، مثل ملف. يعيد المعالج `Response` أو جسمًا مثل سلسلة نصية أو تدفق (stream)، ويستقبل العميل `Response`:

```ts
export const reports = defineContract('/reports', {
  csv: get('/:year', { response: raw('text/csv') }),
});
```

## الأخطاء {#errors}

يصرّح المسار بالأخطاء التي ينبغي للعميل معالجتها بالصيغة `errors: { CODE: status }`. يطلقها المعالج بـ `ctx.fail('CODE', detail?)`، ويتلقى العميل استجابة `application/problem+json`:

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

إضافة إلى الرموز المصرَّح بها، يمكن لكل مسار أن يجيب بالرموز المضمَّنة `BAD_REQUEST` و`VALIDATION_FAILED` و`INVALID_JSON` و`UNAUTHORIZED` و`FORBIDDEN` و`NOT_FOUND` و`METHOD_NOT_ALLOWED` و`BODY_TOO_LARGE` و`UNSUPPORTED_MEDIA_TYPE` و`INTERNAL_ERROR` و`SERVICE_UNAVAILABLE`. وتسرد مشكلة `VALIDATION_FAILED` كل خلل في `errors` بالصيغة `{ in, pointer, message }`.

## مكتبات المخططات {#schema-libraries}

تعمل أي مكتبة [Standard Schema](https://standardschema.dev)، ويمكن للعقد الواحد أن يخلط بينها.

- **valibot** هي الخيار الافتراضي الموصى به للشيفرة التي تُشحن إلى المتصفح، لأن المدقّقات التي تستخدمها فقط هي التي تنتهي في الحزمة.
- **zod** تعمل أيضًا. تنتقل التواريخ كسلاسل نصية في JSON، لذا صرّح بها بـ `z.iso.datetime()` بدلًا من `z.date()`.

تعمل المخططات على الخادم. فهو يتحقق من أجزاء الطلب قبل تشغيل المعالج ويمرّر ناتج المخطط إلى المعالج، ولذلك فإن `v.trim()` في مخطط الجسم يقص الفراغات على الخادم. أما العميل فيرسل مدخله المُنمَّط بصيغة JSON دون تحقق، ويُنمِّط الاستجابة من المخطط دون تحقق ثانٍ.

## استدعاء عقد {#calling-a-contract}

تعيد `createClient(contracts, options)` دالة واحدة لكل مسار. لا يرمي الاستدعاء أبدًا عند فشل HTTP أو الشبكة؛ بل يُحَلّ إلى `ApiResult` تضيّقه على `ok`، ثم على `error.code`:

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

- كائن المدخل فيه `params` و`query` و`headers` و`body`، كلٌّ منها مُنمَّط من المسار.
- يأخذ الوسيط الثاني `{ signal, headers }`. وقد تكون `options.headers` دالة تُستدعى لكل طلب، مثل دالة تضيف ترويسة تفويض.
- فشل الشبكة يُحَلّ بـ `code: 'NETWORK_ERROR'` و`status: 0`، والإلغاء بـ `ABORTED`، والاستجابة الفاشلة التي ليست مشكلة (problem)، أو الجسم الذي ليس JSON، بـ `UNEXPECTED_RESPONSE`.
- تمرّر الاختبارات `fetch: app.fetch` لاستدعاء تطبيق داخل العملية نفسها؛ انظر [الاختبار](https://vibejs.org/v0/server/testing).

## OpenAPI {#openapi}

تعيد `generateOpenApi(contracts, options)` من `@usevibejs/server/openapi` مستند OpenAPI 3.1 لسجل العقود نفسه الذي يأخذه العميل. قدِّمه عبر middleware. يرى الـ middleware مسار الطلب الكامل، بما فيه المسار الأساسي، ولذلك تجيب الوصفة أدناه عن `/api/openapi.json` تحت المسار الأساسي `/api`:

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

يُحوَّل كل مخطط بمحوّل Standard JSON Schema الخاص به. مخططات zod تحمل واحدًا؛ أما مخططات valibot فغلّفها بـ `toStandardJsonSchema()` من `@valibot/to-json-schema`، أو مرّر دالة بديلة `toJsonSchema(schema, io)`. المخطط الذي لا يمكن تحويله يرمي [VIBE9801](https://vibejs.org/v0/errors/VIBE9801)، ومخططان مختلفان بالاسم نفسه يرميان [VIBE9802](https://vibejs.org/v0/errors/VIBE9802)، وحالة خطأ خارج 400–599 ترمي [VIBE9803](https://vibejs.org/v0/errors/VIBE9803).
