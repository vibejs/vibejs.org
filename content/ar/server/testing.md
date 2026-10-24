# اختبار الخادم

تعمل اختبارات الخادم داخل العملية نفسها: لا منفذ ولا شبكة. تبني `Test.createTestingModule()` من `@usevibejs/server/testing` الـ `App` نفسه الذي يعمل في الإنتاج، من الوحدات التي تذكرها، ويقدّم `app.fetch` الطلبات.

```ts
const app = await Test.createTestingModule({
  imports: [TodosModule],
  basePath: '/api',
  logger: new JsonLogger({ level: 'silent' }),
}).compile();
const api = createClient({ todos }, { baseUrl: '/api', fetch: app.fetch });

const result = await api.todos.list();
if (!result.ok) throw new Error(result.error.code);
expect(result.data).toEqual(['write tests']);

await app.close();
```

تقبل `createTestingModule()` خيارات الوحدة (`imports` و`providers` و`controllers`) وخيارات التطبيق (`basePath` و`logger` و`guards` وغيرها) في كائن واحد. وزّع `appOptions` من `app.module.ts` لتختبر بخيارات الإنتاج.

استدعاء المسارات عبر `createClient` يتحقق من العقد أيضًا: لا يُترجم الاختبار إذا تغيّر مسار أو مدخل أو نوع استجابة. ضيّق نوع النتيجة كما تفعل الواجهة:

```ts
const api = createClient({ todos }, { baseUrl: '/api', fetch: app.fetch });
const removed = await api.todos.remove({ params: { id: 'missing' } });
if (removed.ok || removed.error.code !== 'TODO_NOT_FOUND') throw new Error('expected a 404');
expect(removed.error.status).toBe(404);
```

للطلبات التي لا يغطيها عقد، مثل مسار غير موجود أو جسم تالف، استخدم `app.request(path, init?)`، و`init.json` يرسل جسمًا بصيغة JSON.

## استبدال providers {#replacing-providers}

تستبدل `overrideProvider(token)` الـ provider بحسب الـ token في كل وحدة توفّره، قبل إنشاء أي شيء:

```ts
const sent: string[] = [];
const app = await Test.createTestingModule({
  imports: [MailModule],
  logger: new JsonLogger({ level: 'silent' }),
})
  .overrideProvider(Mailer)
  .useValue({ send: (to: string) => (sent.push(to), to) })
  .compile();

app.get(Mailer).send('ada@example.com');
```

المتاح هو `useValue` و`useClass` و`useFactory`. واستبدال token لا توفّره أي وحدة يفشل بالرمز [VIBE9701](https://vibejs.org/v0/errors/VIBE9701). ويقرأ `app.get(token)` الـ provider، كخدمة يفحص الاختبار حالتها.

## السجلّات {#logs}

مرّر `logger: new JsonLogger({ level: 'silent' })` لتبقى مخرجات الاختبار نظيفة، أو `JsonLogger` مع دالة `write` لتتحقق من مدخلات السجلّ. سجلّات إطار العمل نفسه، للطلبات والأخطاء ودورة الحياة، تذهب إلى هذا المسجِّل. أما استبدال `Logger` فلا يصل إلا إلى الكود الذي يحقنه.

## فحص المخطط {#checking-the-graph}

تعرض `inspect(root, options)` المسارات والوحدات دون إنشاء أي شيء. ولقطة (snapshot) منها تكشف أي تغيير غير مقصود في مسار أو guard أو وحدة:

```ts
expect(inspect(AppModule, appOptions)).toMatchSnapshot();
```
