# الوحدات وproviders

## الوحدات {#modules}

الوحدة (module) صنف عليه `@Module()`. تذكر فيه ما يوفّره، والمتحكّمات التي يسجّلها، والوحدات التي يستوردها، والـ providers التي يسمح للوحدات الأخرى باستخدامها:

```ts
class TodosService {
  list(): string[] {
    return [];
  }
}

@Module({ providers: [TodosService], controllers: [], exports: [TodosService] })
export class TodosModule {}

@Module({ imports: [TodosModule] })
export class AppModule {}
```

ترى الوحدة providers الخاصة بها، وما تصدّره الوحدات التي تستوردها، وما تصدّره الوحدات العامة. وأي شيء آخر يُفشل بدء التشغيل بالرمز [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)، وتذكر الرسالة الوحدة وسلسلة الطلبات التي وصلت إلى الـ token. لا يمكن أن تستورد الوحدات بعضها بعضًا في حلقة ([VIBE9202](https://vibejs.org/v0/errors/VIBE9202))، وكل صنف تستورده يحتاج إلى `@Module()` خاص به ([VIBE9201](https://vibejs.org/v0/errors/VIBE9201)).

تستطيع الوحدة أن تصدّر وحدة استوردتها، فتنتقل صادرات تلك الوحدة إلى من يستورد الوحدة الأولى. ويجعل `@Module({ global: true })` الصادرات مرئية في كل مكان دون استيراد. استخدمه للخدمات المشتركة بين كل الأجزاء، مثل عميل قاعدة البيانات.

## حقن التبعيات {#injecting-dependencies}

التبعيات حقول تأخذ قيمتها الأولى من `inject(Token)`:

```ts
class TodosService {
  private readonly db = inject(Db);

  list(): string[] {
    return this.db.query('select * from todos');
  }
}
```

- تُنشأ providers بـ `new Cls()`. والمُنشئ الذي له معاملات يُرفض بالرمز [VIBE9104](https://vibejs.org/v0/errors/VIBE9104)، فانقل كل معامل إلى حقل `inject()`.
- تعمل `inject()` ما دامت الحاوية تبني الكائن: في مهيّئات الحقول، وفي جسم المُنشئ، وفي الجزء المتزامن من الـ factory. وفي أي مكان آخر ترمي [VIBE9101](https://vibejs.org/v0/errors/VIBE9101).
- اجعل الحقول المحقونة `private`. الحقل العام جزء من النوع المعلَن للصنف، لذلك يحتاج مع `isolatedDeclarations` إلى تعليق نوع صريح (TS9012): `readonly db: Db = inject(Db)`.
- تعيد `inject(Token, { optional: true })` القيمة `undefined` إذا لم يكن أي provider مرئيًا.

## Providers {#providers}

الـ provider صنف، أو كائن يسمّي token في `provide` ويحدّد طريقة إنشاء قيمته:

```ts
const ApiUrl = token<string>('ApiUrl');
const Clock = token<() => number>('Clock');
const Now = token<() => number>('Now');

export const providers: Provider[] = [
  { provide: TodosService, useClass: MemoryTodosService },
  { provide: ApiUrl, useValue: 'https://api.example.com' },
  { provide: Clock, useFactory: () => () => Date.now() },
  { provide: Now, useExisting: Clock },
];
```

تنشئ `token<T>(description)` رمزًا (token) له نوع، لقيمة ليست صنفًا. والصنف هو token نفسه. وإذا ذكرت الوحدة الـ token نفسه مرتين، يفوز المدخل الأخير.

تستقبل الـ factory الرموز المذكورة في `inject` معاملاتٍ، ويمكن أن تكون غير متزامنة:

```ts
const DatabaseUrl = token<string>('DatabaseUrl');
const Database = token<{ close(): Promise<void> }>('Database');

export const database: Provider[] = [
  { provide: DatabaseUrl, useValue: 'postgres://localhost/app' },
  { provide: Database, useFactory: (url: string) => connect(url), inject: [DatabaseUrl] },
];
```

كل factory تُحسم قبل إنشاء أي صنف، فتستطيع الأصناف حقن قيمة الـ factory مباشرة. أما الصنف الذي تحتاج إليه factory أثناء بنائها، فلا يستطيع أن يحقن إلا factories حُسمت من قبل. اذكر هذه التبعية في مصفوفة `inject` الخاصة بالـ factory حتى تُحسم أولًا ([VIBE9106](https://vibejs.org/v0/errors/VIBE9106)).

## خطّافات دورة الحياة {#lifecycle-hooks}

يستطيع صنف provider أو متحكّم أو enhancer أو وحدة أن ينفّذ هذه الخطّافات:

| الخطّاف                           | متى                                                         |
| -------------------------------- | ----------------------------------------------------------- |
| `onModuleInit()`                 | بعد إنشاء كل الكائنات، بترتيب الوحدات (الاستيراد الأعمق أولًا). |
| `onApplicationBootstrap()`       | بعد كل `onModuleInit`.                                      |
| `onModuleDestroy()`              | عند `close()`، بالترتيب المعاكس.                            |
| `onApplicationShutdown(signal?)` | بعد كل `onModuleDestroy`.                                   |

```ts
class Migrations implements OnModuleInit, OnModuleDestroy {
  private readonly db = inject(Database);

  async onModuleInit(): Promise<void> {
    await this.db.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.close();
  }
}
```

تُنتظر خطّافات التهيئة واحدًا بعد الآخر، وأول خطأ يوقف بدء التشغيل. أما خطّافات الإيقاف فتعمل كلها حتى لو فشل أحدها، وتُبلَّغ حالات الفشل معًا بالرمز [VIBE9204](https://vibejs.org/v0/errors/VIBE9204).
