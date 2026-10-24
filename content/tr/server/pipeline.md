# Middleware, guard, interceptor ve filter'lar

Bir istek şu adımlardan geçer:

1. **Middleware**, her şeyin etrafında, `AppOptions.middleware` sırasıyla.
2. **Routing**: hiçbir route eşleşmezse 404, ya da `Allow` ile 405.
3. **Guard'lar**: önce global, sonra controller, sonra metot. `false` döndüren ilk guard isteği 403 `FORBIDDEN` ile sonlandırır.
4. **Interceptor'lar**: önce global, sonra controller, sonra metot; ilki en dıştakidir.
5. İstek parçalarının **doğrulaması**, ardından **handler**.
6. **Yanıt** oluşturma ve yanıt doğrulaması.
7. 3. ile 6. adımlardaki herhangi bir hata için **Filter'lar**: önce metot, sonra controller, sonra global.

`app.inspect()` ve `inspect(root, options)`, her route'un guard'larını, interceptor'larını ve filter'larını, globaller dahil tam olarak bu sırayla listeler.

## Middleware {#middleware}

Middleware, tüm isteği Fetch düzeyinde sarar. Routing'den önce çalışır; bu yüzden hiçbir route ile eşleşmeyenler dahil her isteği görür:

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

`next(req?)` aynı istekle ya da bir yedeğiyle devam eder. Middleware düz bir fonksiyondur; bu yüzden bir paket, yerleşik `cors()` gibi bir middleware factory'si export edebilir.

## Guard'lar {#guards}

Guard, bir isteğin handler'ına ulaşıp ulaşamayacağına karar verir:

```ts
export class SessionGuard implements CanActivate {
  canActivate(ctx: RequestContext): boolean {
    const id = ctx.cookies.get('session');
    if (id) ctx.state.user = { id };
    return id !== undefined;
  }
}
```

Onu bir controller ya da handler üzerinde `@UseGuards(SessionGuard)` ile, ya da global olarak `AppOptions.guards` ile uygulayın. 403 dışında bir yanıt vermek için `new HttpError(401, 'UNAUTHORIZED')` gibi bir `HttpError` fırlatın.

`ctx.state`, guard'lardan ve interceptor'lardan handler'lara değer taşır. Alanlarını `RequestState` arayüzünü genişleterek tipleyin:

```ts
declare module '@usevibejs/server' {
  interface RequestState {
    user?: { readonly id: string };
  }
}
```

## Interceptor'lar {#interceptors}

Interceptor, handler'ı sarar. `next()` zincirin geri kalanını çalıştırır ve handler'ın sonucuyla çözülür; böylece bir interceptor sonucu ölçebilir, yeniden deneyebilir ya da değiştirebilir:

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

## Filter'lar {#filters}

Filter, bir hatayı yanıta çevirir. Bir `Response`, problem olarak gönderilecek bir `HttpError` ya da hatayı sonraki filter'a iletmek için `undefined` döndürür. Hiçbir filter'ın ele almadığı hatalar [Handler'lar](https://vibejs.org/v0/server/handlers#errors) sayfasında anlatıldığı gibi yanıtlanır.

```ts
export class DbErrors implements ExceptionFilter {
  catch(error: unknown): HttpError | undefined {
    return error instanceof NotFoundInDb ? new HttpError(404, 'NOT_FOUND') : undefined;
  }
}
```

Guard'lar, interceptor'lar ve filter'lar constructor parametresi olmayan sınıflardır. Controller'larının modülü kapsamında (globaller kök modülde) bir kez oluşturulurlar; bu yüzden provider'ları `inject()` edebilirler.

## Metadata {#metadata}

`createMetadata<T>(name)`, değeri geri okumak için anahtar da olan tipli bir decorator oluşturur. Metot değerleri controller değerlerini geçersiz kılar:

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

## Global enhancer'lar {#global-enhancers}

`AppOptions`, middleware ve enhancer'ları her route'a uygular:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true })],
  guards: [SessionGuard],
  interceptors: [LogDuration],
  filters: [DbErrors],
};
```
