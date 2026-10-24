# المتحكّمات والمعالجات

يقدّم المتحكّم (controller) عقدًا واحدًا. لكل مسار في العقد دالة معالج واحدة بالضبط، تعلّمها بـ `@Handle(route)`:

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

سجّل المتحكّم في `controllers` داخل وحدة (module). وعند بدء التشغيل يتحقق التطبيق من أن لكل مسار معالجًا واحدًا ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303)، [VIBE9304](https://vibejs.org/v0/errors/VIBE9304))، وأن كل معالج ينتمي إلى عقد المتحكّم ([VIBE9305](https://vibejs.org/v0/errors/VIBE9305))، وأن لكل عقد متحكّمًا واحدًا ([VIBE9306](https://vibejs.org/v0/errors/VIBE9306)).

## السياق {#the-context}

يستقبل المعالج وسيطًا واحدًا هو `ctx: Ctx<typeof contract.route>`:

| الحقل                                | القيمة                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `params`، `query`، `headers`، `body` | أجزاء الطلب بعد التحقق منها. لا يوجد كل جزء إلا إذا عرّفه المسار (أما params فموجودة دائمًا).                    |
| `fail(code, detail?)`                | ينهي الطلب برمز خطأ من الرموز التي يعرّفها المسار.                                                            |
| `req`، `url`                         | الـ `Request` وعنوان URL الخاص به بعد تحليله.                                                                |
| `requestId`                          | الترويسة `x-request-id`، أو معرّف مولَّد. ويُعاد في الاستجابة.                                                    |
| `log`                                | مسجِّل التطبيق وقد أُرفق به `requestId`.                                                                        |
| `cookies`                            | `get` و`set` و`delete`؛ انظر [الإعدادات](https://vibejs.org/v0/server/configuration#cookies).                 |
| `responseHeaders`                    | ترويسات تُضاف إلى الاستجابة.                                                                                   |
| `signal`                             | يُلغى حين ينقطع اتصال العميل.                                                                                 |
| `state`                              | قيم تتشاركها guards وinterceptors مع المعالج.                                                                |
| `getMetadata(key)`                   | بيانات وصفية تضبطها بـ `createMetadata`؛ انظر [خط المعالجة](https://vibejs.org/v0/server/pipeline#metadata). |

يمكن أن يكون المعالج غير متزامن. ويعيد نوع استجابة المسار: نوع مدخلات المخطط لاستجابة JSON، ولا شيء لمسار بلا استجابة، و`Response` أو جسمًا لمسار `raw()`. وإذا أعاد أي معالج `Response`، يُرسل كما هو.

## الأخطاء {#errors}

- **الأخطاء المعرَّفة.** يرمي `ctx.fail('CODE', detail?)` خطأ `HttpError` بالحالة التي يعرّفها العقد. والرموز لها أنواع: لا يُقبل إلا ما عرّفه المسار.
- **أخطاء العميل الأخرى.** استخدم `throw new HttpError(status, code, detail?)` من معالج أو guard أو interceptor أو خدمة. فضّل رمزًا معرَّفًا أو رمزًا مدمجًا مثل `NOT_FOUND`. الرمز غير المعرَّف يُرسل أيضًا، لكن مع التحذير [VIBE9502](https://vibejs.org/v0/errors/VIBE9502).
- **الأخطاء البرمجية.** أي خطأ آخر يُسجَّل مع سببه ([VIBE9503](https://vibejs.org/v0/errors/VIBE9503))، ويجيب التطبيق بـ 500 `INTERNAL_ERROR` دون تفاصيل.

كل استجابة خطأ من نوع `application/problem+json`: `{ type, title, status, code, detail?, errors?, requestId }`.

```ts
export function requireUser(id: string | undefined): string {
  if (!id) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in first');
  return id;
}
```

## التحقق {#validation}

قبل تشغيل المعالج، يتحقق التطبيق من `params` و`query` و`headers` و`body` بمخططات المسار، ويضع ناتج المخطط في `ctx`. إذا فشل أي جزء، يستقبل العميل 400 `VALIDATION_FAILED` ومعه كل خلل في `errors`، ولا يعمل المعالج. والجسم الذي ليس JSON يأخذ 400 `INVALID_JSON`، والجسم الذي يتجاوز `bodyLimit` يأخذ 413 `BODY_TOO_LARGE`.

إذا كان `validateResponses` مفعّلًا، وهو كذلك افتراضيًا، يتحقق التطبيق من نتيجة المعالج بمخطط الاستجابة ثم يرسل ناتج المخطط. وعدم التطابق خطأ برمجي في الخادم: يسجّله التطبيق بالرمز [VIBE9501](https://vibejs.org/v0/errors/VIBE9501) ويجيب بـ 500.

ولأن ناتج المخطط هو ما يُرسل، فالمخطط يقرّر أي المفاتيح تصل إلى العميل:

- `v.object()` في valibot و`z.object()` في zod يحذفان المفاتيح التي لا يعرّفها المخطط، فلا يُرسل حقل داخلي مثل `passwordHash`.
- يُبقي arktype المفاتيح غير المعرَّفة، إلا إذا ضبط النوع `"+": "delete"`.
- مع `validateResponses: false`، تُرسل النتيجة دون تغيير.

عرّف مخطط استجابة صريحًا لكل مسار يعيد بيانات مخزّنة، وأبقِ `validateResponses` مفعّلًا.

## TS1241 على @Handle {#ts1241-on-handle}

ظهور `TS1241: Unable to resolve signature of method decorator when called as an expression` على سطر `@Handle(...)` يعني أن الدالة لا تطابق المسار. يبلّغ `vibejs check` عن هذا الخطأ ويقترح هذا الإصلاح:

> the handler must be `(ctx: Ctx<typeof contract.route>)` and return the route response type; do not cast or use `any`

افحص بهذا الترتيب:

1. المعامل هو `ctx: Ctx<typeof contract.route>` للمسار نفسه الذي يسمّيه `@Handle`، أو أن الدالة بلا معاملات.
2. نوع الإرجاع هو نوع الاستجابة. السبب المعتاد حقل ناقص أو نوع غير صحيح في الكائن المعاد. أضف نوع إرجاع صريحًا إلى الدالة لترى الحقل بالضبط في رسالة الخطأ.
3. المسار الذي ليس له `response` يعيد `void`.

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

الإصلاح أن تعيد `{ id: ctx.params.id }` بنوع الإرجاع `{ id: string }`. لا تُسكت الخطأ أبدًا بتحويل نوع (cast) أو بـ `any`: المزخرف هو ما يبقي المعالج والعميل متوافقين.
