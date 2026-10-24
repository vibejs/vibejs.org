# Middleware والحراس والمعترضات والمرشِّحات

يمرّ الطلب بهذه الخطوات:

1. **Middleware**، حول كل شيء، بترتيب `AppOptions.middleware`.
2. **التوجيه**: 404، أو 405 مع `Allow`، عندما لا يطابق أي مسار.
3. **الحراس (Guards)**: العامة، ثم حراس المتحكم، ثم حراس الدالة. أول حارس يعيد `false` ينهي الطلب بالحالة 403 `FORBIDDEN`.
4. **المعترضات (Interceptors)**: العامة، ثم المتحكم، ثم الدالة؛ والأول هو الأبعد (الأخارجي).
5. **التحقق** من أجزاء الطلب، ثم **المعالج**.
6. بناء **الاستجابة** والتحقق منها.
7. **المرشِّحات (Filters)** لأي خطأ في الخطوات من 3 إلى 6: الدالة، ثم المتحكم، ثم العام.

يسرد `app.inspect()` و`inspect(root, options)` حراس كل مسار ومعترضاته ومرشِّحاته بهذا الترتيب بالضبط، بما فيها العامة.

## Middleware {#middleware}

يغلّف الـ middleware الطلب كله على مستوى Fetch. يعمل قبل التوجيه، فيرى كل طلب، بما في ذلك الطلبات التي لا تطابق أي مسار:

```ts
export const timing: Middleware = async (req, next) => {
  const started = performance.now();
  const res = await next();
  // A copy has mutable headers, even for a redirect.
  const out = new Response(res.body, res);
  out.headers.set('server-timing', `app;dur=${Math.round(performance.now() - started)}`);
  return out;
};
```

تتابع `next(req?)` بالطلب نفسه أو ببديل عنه. الـ middleware دالة عادية، ولذلك يمكن لحزمة أن تصدّر factory لـ middleware، مثل `cors()` المضمَّنة.

## الحراس {#guards}

يقرر الحارس ما إذا كان يجوز للطلب أن يصل إلى معالجه:

```ts
export class SessionGuard implements CanActivate {
  canActivate(ctx: RequestContext): boolean {
    const id = ctx.cookies.get('session');
    if (id) ctx.state.user = { id };
    return id !== undefined;
  }
}
```

طبّقه بـ `@UseGuards(SessionGuard)` على متحكم أو معالج، أو بشكل عام بـ `AppOptions.guards`. وللإجابة بشيء غير 403، ارمِ `HttpError`، مثل `new HttpError(401, 'UNAUTHORIZED')`.

تحمل `ctx.state` القيم من الحراس والمعترضات إلى المعالجات. نمِّط حقولها بتوسيع `RequestState`:

```ts
declare module '@usevibejs/server' {
  interface RequestState {
    user?: { readonly id: string };
  }
}
```

## المعترضات {#interceptors}

يغلّف المعترض المعالج. تشغّل `next()` بقية السلسلة وتُحَلّ إلى نتيجة المعالج، ولذلك يستطيع المعترض أن يقيس النتيجة أو يعيد المحاولة أو يستبدلها:

```ts
export class LogDuration implements Interceptor {
  async intercept(ctx: RequestContext, next: () => Promise<unknown>): Promise<unknown> {
    const started = performance.now();
    try {
      return await next();
    } finally {
      ctx.log.info('handled', { ms: Math.round(performance.now() - started) });
    }
  }
}
```

## المرشِّحات {#filters}

يحوّل المرشِّح الخطأ إلى استجابة. يعيد `Response`، أو `HttpError` ليُرسل كمشكلة (problem)، أو `undefined` لتمرير الخطأ إلى المرشِّح التالي. الأخطاء التي لا يعالجها أي مرشِّح يُجاب عنها كما هو موصوف في [المعالجات](https://vibejs.org/v0/server/handlers#errors).

```ts
export class DbErrors implements ExceptionFilter {
  catch(error: unknown): HttpError | undefined {
    return error instanceof NotFoundInDb ? new HttpError(404, 'NOT_FOUND') : undefined;
  }
}
```

الحراس والمعترضات والمرشِّحات أصناف بلا معاملات في المُنشِئ. تُنشأ مرة واحدة، في نطاق وحدة متحكمها (والعامة في الوحدة الجذرية)، ولذلك تستطيع أن تحقن المزوِّدين بـ `inject()`.

## البيانات الوصفية {#metadata}

تنشئ `createMetadata<T>(name)` مزخرفًا مُنمَّطًا هو أيضًا المفتاح الذي تُقرأ به القيمة. وقيم الدالة تتغلب على قيم المتحكم:

```ts
export const Roles = createMetadata<readonly string[]>('roles');

class RolesGuard implements CanActivate {
  canActivate(ctx: RequestContext): boolean {
    const needed = ctx.getMetadata(Roles) ?? [];
    if (!needed.every((role) => ctx.state.roles?.includes(role))) {
      throw new HttpError(403, 'FORBIDDEN', `Needs ${needed.join(', ')}`);
    }
    return true;
  }
}

@Controller(admin)
@UseGuards(RolesGuard)
@Roles(['admin'])
export class AdminController {
  @Handle(admin.stats)
  stats(): void {}
}
```

## المعزِّزات العامة {#global-enhancers}

يطبّق `AppOptions` الـ middleware والمعزِّزات (enhancers) على كل مسار:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true })],
  guards: [SessionGuard],
  interceptors: [LogDuration],
  filters: [DbErrors],
};
```
