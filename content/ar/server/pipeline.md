# middleware وguards وinterceptors والمرشِّحات

يمر الطلب بهذه الخطوات:

1. **middleware**، حول كل شيء، بترتيب `AppOptions.middleware`.
2. **التوجيه**: 404، أو 405 مع `Allow`، إذا لم يطابق أي مسار.
3. **guards**: العامة، ثم guards المتحكّم، ثم guards الدالة. أول guard يعيد `false` ينهي الطلب بـ 403 `FORBIDDEN`.
4. **interceptors**: العامة، ثم interceptors المتحكّم، ثم interceptors الدالة. والأول هو الغلاف الخارجي.
5. **التحقق** من أجزاء الطلب، ثم **المعالج**.
6. **بناء الاستجابة** والتحقق منها.
7. **المرشِّحات (filters)** لأي خطأ في الخطوات من 3 إلى 6: مرشِّحات الدالة، ثم المتحكّم، ثم العامة.

تعرض `app.inspect()` و`inspect(root, options)` الـ guards والـ interceptors والمرشِّحات لكل مسار بهذا الترتيب بالضبط، ومعها العامة.

## Middleware {#middleware}

يغلّف الـ middleware الطلب كله على مستوى Fetch. ويعمل قبل التوجيه، فيرى كل طلب، حتى الطلبات التي لا تطابق أي مسار:

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

يكمل `next(req?)` بالطلب نفسه أو بطلب بديل. والـ middleware دالة عادية، فتستطيع الحزمة أن تصدّر factory تنتج middleware، مثل `cors()` المدمجة.

## Guards {#guards}

يقرّر الـ guard هل يصل الطلب إلى معالجه:

```ts
export class SessionGuard implements CanActivate {
  canActivate(ctx: RequestContext): boolean {
    const id = ctx.cookies.get('session');
    if (id) ctx.state.user = { id };
    return id !== undefined;
  }
}
```

طبّقه بـ `@UseGuards(SessionGuard)` على متحكّم أو معالج، أو على كل المسارات بـ `AppOptions.guards`. وإذا أردت إجابة غير 403، فارمِ `HttpError`، مثل `new HttpError(401, 'UNAUTHORIZED')`.

ينقل `ctx.state` القيم من guards وinterceptors إلى المعالجات. وتحدّد أنواع حقوله بتوسيع `RequestState`:

```ts
declare module '@usevibejs/server' {
  interface RequestState {
    user?: { readonly id: string };
  }
}
```

## Interceptors {#interceptors}

يغلّف الـ interceptor المعالج. تشغّل `next()` بقية السلسلة وتُحسم بنتيجة المعالج، فيستطيع الـ interceptor أن يقيسها أو يعيد المحاولة أو يستبدلها:

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

يحوّل المرشِّح الخطأ إلى استجابة. يعيد `Response`، أو `HttpError` ليُرسل مشكلةً (problem)، أو `undefined` ليمرّر الخطأ إلى المرشِّح التالي. والأخطاء التي لا يعالجها أي مرشِّح يُجاب عنها كما في [المعالجات](https://vibejs.org/v0/server/handlers#errors).

```ts
export class DbErrors implements ExceptionFilter {
  catch(error: unknown): HttpError | undefined {
    return error instanceof NotFoundInDb ? new HttpError(404, 'NOT_FOUND') : undefined;
  }
}
```

الـ guards والـ interceptors والمرشِّحات أصناف بلا معاملات في المُنشئ. تُنشأ مرة واحدة، في نطاق وحدة المتحكّم الخاص بها (والعامة في الوحدة الجذر)، فتستطيع أن تستدعي `inject()` لجلب providers.

## البيانات الوصفية {#metadata}

تنشئ `createMetadata<T>(name)` مزخرفًا له نوع، وهو نفسه المفتاح الذي تقرأ به القيمة لاحقًا. وقيم الدالة تتقدّم على قيم المتحكّم:

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

## المحسِّنات العامة {#global-enhancers}

يطبّق `AppOptions` الـ middleware والمحسِّنات (enhancers) على كل المسارات:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true })],
  guards: [SessionGuard],
  interceptors: [LogDuration],
  filters: [DbErrors],
};
```
