# اختبار الخادم

تعمل اختبارات الخادم داخل العملية نفسها: بلا منفذ وبلا شبكة. تبني `Test.createTestingModule()` من `@usevibejs/server/testing` الـ `App` نفسه الذي يعمل في الإنتاج من الوحدات التي تسردها، ويخدم `app.fetch` الطلبات.

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

تأخذ `createTestingModule()` خيارات الوحدة (`imports` و`providers` و`controllers`) وخيارات التطبيق (`basePath` و`logger` و`guards` وغيرها) في كائن واحد. انشر `appOptions` من `app.module.ts` للاختبار بخيارات الإنتاج.

استدعاء المسارات عبر `createClient` يفحص العقد أيضًا: يفشل الاختبار في الترجمة عندما يتغير مسار أو مدخل أو نوع استجابة. ضيّق النتيجة كما تفعل الواجهة:

```ts
const api = createClient({ todos }, { baseUrl: '/api', fetch: app.fetch });
const removed = await api.todos.remove({ params: { id: 'missing' } });
if (removed.ok || removed.error.code !== 'TODO_NOT_FOUND') throw new Error('expected a 404');
expect(removed.error.status).toBe(404);
```

للطلبات خارج العقد، مثل مسار مفقود أو جسم مشوَّه، استخدم `app.request(path, init?)`؛ و`init.json` يرسل جسم JSON.

## استبدال المزوِّدين {#replacing-providers}

تستبدل `overrideProvider(token)` مزوِّدًا بحسب رمزه في كل وحدة توفّره، قبل إنشاء أي شيء:

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

تتوفر `useValue` و`useClass` و`useFactory`. استبدال رمز لا توفّره أي وحدة يفشل بالرمز [VIBE9701](https://vibejs.org/v0/errors/VIBE9701). وتقرأ `app.get(token)` مزوِّدًا، مثل خدمة يفحص اختبار حالتها.

## السجلات {#logs}

مرّر `logger: new JsonLogger({ level: 'silent' })` لإبقاء مخرجات الاختبار نظيفة، أو `JsonLogger` مع دالة `write` للتحقق من مدخلات السجل. سجلات الإطار الخاصة بالطلبات والأخطاء ودورة الحياة تذهب إلى هذا المسجِّل؛ واستبدال `Logger` يصل فقط إلى الشيفرة التي تحقنه.

## فحص الرسم البياني {#checking-the-graph}

تسرد `inspect(root, options)` المسارات والوحدات دون إنشاء أي شيء. ولقطة (snapshot) منها تكشف أي تغيير غير مقصود في مسار أو حارس أو وحدة:

```ts
expect(inspect(AppModule, appOptions)).toMatchSnapshot();
```
