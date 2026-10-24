# الإعداد

## إعداد البيئة {#environment-config}

تعيد `defineConfig(schema)` صنفًا (class) يتحقق مُنشِئه من متغيرات البيئة التي تسمّيها مفاتيح المخطط. وفّره كأي صنف واحقنه حيث تحتاج إليه:

```ts
export class AppConfig extends defineConfig({
  DATABASE_URL: v.pipe(v.string(), v.url()),
  PORT: v.optional(v.pipe(v.string(), v.transform(Number)), '3000'),
}) {}

class Db {
  private readonly config = inject(AppConfig);

  url(): string {
    return this.config.DATABASE_URL;
  }
}

@Module({ global: true, providers: [AppConfig, Db], exports: [AppConfig, Db] })
export class CoreModule {}
```

يُتحقَّق من الإعداد مرة واحدة، عند إنشاء التطبيق. يُبلَّغ عن كل المفاتيح الفاشلة دفعة واحدة بالرمز [VIBE9601](https://vibejs.org/v0/errors/VIBE9601)؛ وتسمّي الرسالة المفاتيح ولا تطبع القيم أبدًا. ويجب أن تكون المخططات متزامنة ([VIBE9602](https://vibejs.org/v0/errors/VIBE9602)). والكائن المتحقَّق منه مجمَّد.

## التسجيل {#logging}

يُوفَّر مسجِّل التطبيق باسم `Logger` في كل وحدة. احقنه لتسجّل في الوجهة نفسها التي يستخدمها الإطار:

```ts
class Mailer {
  private readonly log = inject(Logger);

  send(to: string): void {
    this.log.info('mail sent', { to });
  }
}
```

المسجِّل الافتراضي هو `JsonLogger`، الذي يكتب سطر JSON واحدًا لكل مدخل: `{ time, level, msg, ...fields }`. مرّر مسجِّلًا آخر في `AppOptions.logger`:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  logger: new JsonLogger({ level: 'debug', fields: { service: 'todo' } }),
};
```

المستويات هي `debug` و`info` (الافتراضي) و`warn` و`error` و`silent`. يُسجَّل كل طلب بالمستوى `debug` مع طريقته ومساره وحالته ومدته. و`ctx.log` في معالج هو مسجِّل ابن يضيف `requestId`. ولإرسال السجلات إلى مكان آخر، وسِّع الصنف المجرّد `Logger`، أو مرّر `write` إلى `JsonLogger`.

## CORS {#cors}

`cors(options)` هو middleware. يجيب عن طلبات preflight ويضيف ترويسات CORS إلى الاستجابات للأصول (origins) المسموحة:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true, maxAge: 600 })],
};
```

`origin` هو `'*'` أو قائمة أصول أو دالة شرطية (predicate). يُرفض `'*'` مع `credentials: true` ([VIBE9404](https://vibejs.org/v0/errors/VIBE9404))، لأن المتصفحات تتجاهله. وعندما تتشارك الواجهة وAPI الأصل نفسه، وهو التخطيط الافتراضي، لا حاجة إلى CORS.

## ملفات تعريف الارتباط {#cookies}

تقرأ `ctx.cookies` ملفات تعريف الارتباط (cookies) للطلب وتضبط ملفات الاستجابة. ملفات الارتباط الجديدة تكون `HttpOnly` و`Secure` و`SameSite=Lax` و`Path=/` ما لم تقل الخيارات غير ذلك:

```ts
@Controller(session)
export class SessionController {
  @Handle(session.start)
  start(ctx: Ctx<typeof session.start>): void {
    ctx.cookies.set('session', crypto.randomUUID(), { maxAge: 60 * 60 * 24 });
  }

  @Handle(session.end)
  end(ctx: Ctx<typeof session.end>): void {
    ctx.cookies.delete('session');
  }
}
```

يجب أن يكون اسم الـ cookie رمزًا (token) وفق RFC 9110 ([VIBE9504](https://vibejs.org/v0/errors/VIBE9504)).

## الحدود والإيقاف {#limits-and-shutdown}

| الخيار              | الافتراضي  | المعنى                                                                                               |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `basePath`          | `''`      | بادئة كل مسار، مثل `/api` ([VIBE9405](https://vibejs.org/v0/errors/VIBE9405)).                       |
| `bodyLimit`         | 1 MiB     | أكبر جسم طلب بالبايت؛ والأجسام الأكبر تحصل على 413.                                                    |
| `shutdownTimeout`   | 10 000 ms | المدة التي ينتظر فيها `close()` الطلبات الجارية ([VIBE9402](https://vibejs.org/v0/errors/VIBE9402)). |
| `validateResponses` | `true`    | يتحقق من نتائج المعالجات؛ انظر [المعالجات](https://vibejs.org/v0/server/handlers#validation).        |

## إعداد TypeScript {#typescript-setup}

مزخرفات الخادم (decorators) هي مزخرفات TypeScript القديمة. يفعّلها ملف `tsconfig.json` الخاص بالخادم:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

- لا تفعّل `emitDecoratorMetadata` أبدًا ولا تستورد `reflect-metadata`: تُصرَّح الاعتماديات بـ `inject()`، ولا تُقرأ من الأنواع.
- بدون `experimentalDecorators`، ترمي المزخرفات الرمز [VIBE9301](https://vibejs.org/v0/errors/VIBE9301) عند تعريف الصنف المزخرف.
- يترجم Vite وVitest المزخرفات بواسطة Oxc، الذي يستورد دوال المساعدة الخاصة به من `@oxc-project/runtime`. أبقِ `@oxc-project/runtime` اعتمادية مباشرة لحزمة الخادم لتُحَلّ دوال المساعدة.
