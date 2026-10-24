# الإعدادات

## إعدادات البيئة {#environment-config}

تعيد `defineConfig(schema)` صنفًا يتحقق مُنشئه من متغيرات البيئة التي تسمّيها مفاتيح المخطط. وفّره كأي صنف آخر، واحقنه حيث تحتاج إليه:

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

يُتحقق من الإعدادات مرة واحدة، عند إنشاء التطبيق. وكل المفاتيح الفاشلة تُبلَّغ دفعة واحدة بالرمز [VIBE9601](https://vibejs.org/v0/errors/VIBE9601)، وتذكر الرسالة أسماء المفاتيح دون أن تطبع قيمها أبدًا. يجب أن تكون المخططات متزامنة ([VIBE9602](https://vibejs.org/v0/errors/VIBE9602)). والكائن الناتج بعد التحقق مجمَّد.

## السجلّات {#logging}

يوفَّر مسجِّل التطبيق باسم `Logger` في كل وحدة (module). احقنه لتكتب سجلّاتك إلى الوجهة نفسها التي يكتب إليها إطار العمل:

```ts
class Mailer {
  private readonly log = inject(Logger);

  send(to: string): void {
    this.log.info('mail sent', { to });
  }
}
```

المسجِّل الافتراضي هو `JsonLogger`، ويكتب سطر JSON واحدًا لكل مدخل: `{ time, level, msg, ...fields }`. ولتستخدم مسجِّلًا آخر، مرّره في `AppOptions.logger`:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  logger: new JsonLogger({ level: 'debug', fields: { service: 'todo' } }),
};
```

المستويات هي `debug` و`info` (الافتراضي) و`warn` و`error` و`silent`. يُسجَّل كل طلب في المستوى `debug` مع طريقته ومساره وحالته ومدته. و`ctx.log` داخل المعالج مسجِّل فرعي يضيف `requestId`. لإرسال السجلّات إلى مكان آخر، وسّع الصنف المجرّد `Logger`، أو مرّر `write` إلى `JsonLogger`.

## CORS {#cors}

`cors(options)` من نوع middleware. يجيب عن طلبات preflight، ويضيف ترويسات CORS إلى الاستجابات للمصادر (origins) المسموح بها:

```ts
export const appOptions: AppOptions = {
  basePath: '/api',
  middleware: [cors({ origin: ['https://app.example.com'], credentials: true, maxAge: 600 })],
};
```

قيمة `origin` إما `'*'`، وإما قائمة مصادر، وإما دالة شرطية. ويُرفض `'*'` مع `credentials: true` ([VIBE9404](https://vibejs.org/v0/errors/VIBE9404))، لأن المتصفحات تتجاهل هذا الجمع. وإذا كانت الواجهة وAPI على المصدر نفسه، وهذا هو التوزيع الافتراضي، فلا حاجة إلى CORS.

## ملفات تعريف الارتباط {#cookies}

يقرأ `ctx.cookies` ملفات تعريف الارتباط في الطلب، ويضبطها في الاستجابة. الملفات الجديدة تكون `HttpOnly` و`Secure` و`SameSite=Lax` و`Path=/`، ما لم تحدّد الخيارات غير ذلك:

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

يجب أن يكون اسم ملف تعريف الارتباط token وفق RFC 9110 ([VIBE9504](https://vibejs.org/v0/errors/VIBE9504)).

## الحدود والإيقاف {#limits-and-shutdown}

| الخيار              | الافتراضي  | المعنى                                                                                                      |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `basePath`          | `''`      | بادئة كل المسارات، مثل `/api` ([VIBE9405](https://vibejs.org/v0/errors/VIBE9405)).                          |
| `bodyLimit`         | 1 MiB     | أكبر حجم لجسم الطلب بالبايت، وما يزيد عليه يأخذ 413.                                                        |
| `shutdownTimeout`   | 10 000 ms | المدة التي تنتظرها `close()` حتى تنتهي الطلبات الجارية ([VIBE9402](https://vibejs.org/v0/errors/VIBE9402)). |
| `validateResponses` | `true`    | يتحقق من نتائج المعالجات؛ انظر [المعالجات](https://vibejs.org/v0/server/handlers#validation).               |

## إعداد TypeScript {#typescript-setup}

مزخرفات (decorators) الخادم هي مزخرفات TypeScript القديمة (legacy). ويفعّلها `tsconfig.json` الخاص بالخادم:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

- لا تفعّل `emitDecoratorMetadata` أبدًا، ولا تستورد `reflect-metadata` أبدًا: التبعيات تُعرَّف بـ `inject()`، ولا تُقرأ من الأنواع.
- دون `experimentalDecorators`، ترمي المزخرفات [VIBE9301](https://vibejs.org/v0/errors/VIBE9301) عند تعريف الصنف المزخرَف.
- يترجم Vite وVitest المزخرفات بـ Oxc، وهو يستورد دواله المساعدة من `@oxc-project/runtime`. أبقِ `@oxc-project/runtime` تبعية مباشرة لحزمة الخادم، حتى يُعثر على هذه الدوال.
