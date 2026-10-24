# Middleware, guard, interceptor ve filter'lar

Bir istek şu adımlardan geçer:

1. **Middleware**, her şeyi sarar ve `AppOptions.middleware` sırasıyla çalışır.
2. **Yönlendirme**: hiçbir rota eşleşmezse 404, ya da `Allow` header'ıyla 405.
3. **Guard'lar**: önce global, sonra controller, sonra method seviyesindekiler. `false` dönen ilk guard isteği 403 `FORBIDDEN` ile bitirir.
4. **Interceptor'lar**: önce global, sonra controller, sonra method seviyesindekiler. İlki en dıştakidir.
5. İsteğin parçalarının **doğrulanması**, ardından **handler**.
6. Yanıtın **oluşturulması** ve doğrulanması.
7. 3 ile 6 arasındaki adımlarda çıkan her hata için **filter'lar**: önce method, sonra controller, sonra global seviyesindekiler.

`app.inspect()` ve `inspect(root, options)` her rotanın guard'larını, interceptor'larını ve filter'larını global olanlar dahil tam olarak bu sırayla listeler.

## Middleware {#middleware}

Middleware, isteğin tamamını Fetch seviyesinde sarar. Yönlendirmeden önce çalışır, yani hiçbir rotayla eşleşmeyenler dahil her isteği görür:

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

`next(req?)` aynı istekle ya da yerine koyduğun bir istekle devam eder. Middleware düz bir fonksiyondur. Bu yüzden bir paket, yerleşik `cors()` gibi middleware üreten bir factory export edebilir.

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

Bir controller'a ya da handler'a `@UseGuards(SessionGuard)` ile, global olarak da `AppOptions.guards` ile uygularsın. 403 dışında bir şeyle cevap vermek istiyorsan `new HttpError(401, 'UNAUTHORIZED')` gibi bir `HttpError` fırlat.

`ctx.state`, guard'lardan ve interceptor'lardan handler'lara değer taşır. Alanlarının tipini `RequestState` arayüzünü genişleterek verirsin:

```ts
declare module '@usevibejs/server' {
  interface RequestState {
    user?: { readonly id: string };
  }
}
```

## Interceptor'lar {#interceptors}

Interceptor handler'ı sarar. `next()` zincirin geri kalanını çalıştırır ve handler'ın sonucuyla resolve olur. Böylece interceptor bu sonucu ölçebilir, işi yeniden deneyebilir ya da sonucu değiştirebilir:

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

Filter bir hatayı yanıta çevirir. Bir `Response`, problem olarak gönderilecek bir `HttpError` ya da hatayı bir sonraki filter'a bırakmak için `undefined` döner. Hiçbir filter'ın ele almadığı hatalar [Handler'lar](https://vibejs.org/v0/server/handlers#errors) sayfasında anlatıldığı gibi cevaplanır.

```ts
export class DbErrors implements ExceptionFilter {
  catch(error: unknown): HttpError | undefined {
    return error instanceof NotFoundInDb ? new HttpError(404, 'NOT_FOUND') : undefined;
  }
}
```

Guard'lar, interceptor'lar ve filter'lar constructor parametresi olmayan class'lardır. Her biri, controller'ının ait olduğu modülün kapsamında bir kere oluşur (global olanlar kök modülde). Bu yüzden provider'ları `inject()` edebilirler.

## Metadata {#metadata}

`createMetadata<T>(name)` tipli bir decorator oluşturur. Bu decorator aynı zamanda değeri geri okumak için kullandığın anahtardır. Method seviyesindeki değerler controller seviyesindekileri ezer:

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

`AppOptions`, middleware'leri ve enhancer'ları her rotaya uygular:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true })],
  guards: [SessionGuard],
  interceptors: [LogDuration],
  filters: [DbErrors],
};
```
