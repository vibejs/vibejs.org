# المتحكمات والمعالجات

يخدم المتحكم (controller) عقدًا واحدًا. لكل مسار في العقد دالة معالج واحدة بالضبط، تُعلَّم بـ `@Handle(route)`:

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

سجّل المتحكم في `controllers` الخاصة بوحدة (module). عند بدء التشغيل يتحقق التطبيق من أن لكل مسار معالجًا واحدًا ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303)، [VIBE9304](https://vibejs.org/v0/errors/VIBE9304))، ومن أن كل معالج ينتمي إلى عقد المتحكم ([VIBE9305](https://vibejs.org/v0/errors/VIBE9305))، ومن أن لكل عقد متحكمًا واحدًا ([VIBE9306](https://vibejs.org/v0/errors/VIBE9306)).

## السياق {#the-context}

يستقبل المعالج وسيطًا واحدًا، `ctx: Ctx<typeof contract.route>`:

| الحقل                                | القيمة                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `params`, `query`, `headers`, `body` | أجزاء الطلب بعد التحقق منها؛ وكلٌّ منها موجود فقط عندما يصرّح به المسار (والمعاملات `params` دائمًا).           |
| `fail(code, detail?)`                | تنهي الطلب برمز خطأ مصرَّح به للمسار.                                                                        |
| `req`, `url`                         | الـ `Request` وعنوان URL المحلَّل له.                                                                        |
| `requestId`                          | ترويسة `x-request-id`، أو معرّف مولَّد؛ ويُعاد في الاستجابة.                                                    |
| `log`                                | مسجِّل التطبيق مع إرفاق `requestId`.                                                                         |
| `cookies`                            | `get` و`set` و`delete`؛ انظر [الإعداد](https://vibejs.org/v0/server/configuration#cookies).                 |
| `responseHeaders`                    | ترويسات تُضاف إلى الاستجابة.                                                                                 |
| `signal`                             | تُلغى عندما ينقطع اتصال العميل.                                                                             |
| `state`                              | قيم تتشاركها الحراس والمعترضات (interceptors) مع المعالج.                                                  |
| `getMetadata(key)`                   | بيانات وصفية ضُبطت بـ `createMetadata`؛ انظر [خط المعالجة](https://vibejs.org/v0/server/pipeline#metadata). |

قد يكون المعالج غير متزامن. يعيد نوع استجابة المسار: نوع المدخل للمخطط في استجابة JSON، ولا شيء لمسار بلا استجابة، و`Response` أو جسمًا لمسار `raw()`. وإعادة `Response` من أي معالج ترسلها كما هي.

## الأخطاء {#errors}

- **الأخطاء المصرَّح بها.** ترمي `ctx.fail('CODE', detail?)` الخطأ `HttpError` بالحالة التي يصرّح بها العقد. والرموز مُنمَّطة: لا تُقبل إلا الرموز التي صرّح بها المسار.
- **أخطاء العميل الأخرى.** `throw new HttpError(status, code, detail?)` من معالج أو حارس أو معترض أو خدمة. فضّل رمزًا مصرَّحًا به أو رمزًا مضمَّنًا مثل `NOT_FOUND`؛ والرمز غير المصرَّح به يُرسل مع ذلك، مع التحذير [VIBE9502](https://vibejs.org/v0/errors/VIBE9502).
- **الأعطال البرمجية.** أي خطأ آخر يُسجَّل مع سببه ([VIBE9503](https://vibejs.org/v0/errors/VIBE9503)) ويُجاب عنه بالحالة 500 `INTERNAL_ERROR`، دون تفاصيل.

كل استجابة خطأ هي `application/problem+json`: `{ type, title, status, code, detail?, errors?, requestId }`.

```ts
export function requireUser(id: string | undefined): string {
  if (!id) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in first');
  return id;
}
```

## التحقق {#validation}

قبل تشغيل المعالج، يتحقق التطبيق من `params` و`query` و`headers` و`body` مقابل مخططات المسار ويضع ناتج المخطط على `ctx`. وعندما يفشل أي جزء، يتلقى العميل 400 `VALIDATION_FAILED` مع كل خلل في `errors`، ولا يعمل المعالج. الجسم الذي ليس JSON هو 400 `INVALID_JSON`؛ والجسم الذي يتجاوز `bodyLimit` هو 413 `BODY_TOO_LARGE`.

مع `validateResponses` (مفعّلة افتراضيًا)، يُتحقَّق من نتيجة المعالج مقابل مخطط الاستجابة ويُرسل ناتج المخطط. وعدم التطابق عطل في الخادم: يُسجَّل بالرمز [VIBE9501](https://vibejs.org/v0/errors/VIBE9501) ويُجاب عنه بـ 500.

إرسال ناتج المخطط يعني أن المخطط هو الذي يقرر أي المفاتيح تصل إلى العميل:

- يُسقط `v.object()` في valibot و`z.object()` في zod المفاتيح التي لا يصرّح بها المخطط، ولذلك لا يُرسل حقل داخلي مثل `passwordHash`.
- يُبقي arktype المفاتيح غير المصرَّح بها ما لم يضبط النوع `"+": "delete"`.
- مع `validateResponses: false`، تُرسل النتيجة دون تغيير.

صرّح بمخطط استجابة صريح لكل مسار يعيد بيانات مخزَّنة، وأبقِ `validateResponses` مفعّلة.

## TS1241 على @Handle {#ts1241-on-handle}

الخطأ `TS1241: Unable to resolve signature of method decorator when called as an expression` على سطر `@Handle(...)` يعني أن الدالة لا تطابق المسار. يبلّغ عنه `vibejs check` مع هذا الحل:

> the handler must be `(ctx: Ctx<typeof contract.route>)` and return the route response type; do not cast or use `any`

تحقق بهذا الترتيب:

1. المعامل هو `ctx: Ctx<typeof contract.route>` للمسار نفسه الذي يسمّيه `@Handle`، أو لا معامل للدالة.
2. نوع الإعادة هو نوع الاستجابة: السبب المعتاد حقل ناقص أو نوع خاطئ في الكائن المُعاد. أضف نوع إعادة صريحًا إلى الدالة لترى الحقل المحدد في الخطأ.
3. المسار بلا `response` يعيد `void`.

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

الحل هو إعادة `{ id: ctx.params.id }` مع نوع الإعادة `{ id: string }`. لا تُسكِت الخطأ أبدًا بتحويل نوعي (cast) أو `any`: فالمزخرف (decorator) هو ما يُبقي المعالج والعميل متزامنين.
