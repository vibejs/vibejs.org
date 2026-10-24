# الوحدات والمزوِّدون

## الوحدات {#modules}

الوحدة (module) صنف يحمل `@Module()`. تسرد ما توفّره، وأي متحكمات تسجّلها، وأي وحدات تستوردها، وأي من مزوِّديها يجوز لوحدات أخرى استخدامه:

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

ترى الوحدة مزوِّديها، وصادرات الوحدات التي تستوردها، وصادرات الوحدات العامة. وأي شيء آخر يفشل عند بدء التشغيل بالرمز [VIBE9102](https://vibejs.org/v0/errors/VIBE9102)، الذي يسمّي الوحدة والسلسلة التي طلبت الرمز المميّز (token). لا يمكن للوحدات أن تستورد بعضها في دورة ([VIBE9202](https://vibejs.org/v0/errors/VIBE9202))، وكل صنف مستورد يحتاج إلى `@Module()` خاص به ([VIBE9201](https://vibejs.org/v0/errors/VIBE9201)).

يمكن لوحدة أن تصدّر وحدة مستوردة، فتمرّر صادرات تلك الوحدة إلى مستورديها. و`@Module({ global: true })` يجعل الصادرات مرئية في كل مكان دون استيراد؛ استخدمه للخدمات العابرة للميزات مثل عميل قاعدة البيانات.

## حقن الاعتماديات {#injecting-dependencies}

الاعتماديات حقول تُهيَّأ بـ `inject(Token)`:

```ts
class TodosService {
  private readonly db = inject(Db);

  list(): string[] {
    return this.db.query('select * from todos');
  }
}
```

- تُنشأ المزوِّدات بـ `new Cls()`. المُنشِئ ذو المعاملات يُرفض بالرمز [VIBE9104](https://vibejs.org/v0/errors/VIBE9104)؛ انقل كل معامل إلى حقل `inject()`.
- تعمل `inject()` أثناء بناء الحاوية لكائن: في مُهيِّئات الحقول، وفي متن المُنشِئ، وفي الجزء المتزامن من factory. وفي أي مكان آخر ترمي [VIBE9101](https://vibejs.org/v0/errors/VIBE9101).
- اجعل الحقول المحقونة `private`. الحقل العام جزء من النوع المصرَّح به للصنف، ولذلك يحتاج مع `isolatedDeclarations` إلى تعليق نوعي صريح (TS9012): `readonly db: Db = inject(Db)`.
- تعيد `inject(Token, { optional: true })` القيمة `undefined` عندما لا يكون أي مزوِّد مرئيًا.

## المزوِّدون {#providers}

المزوِّد إما صنف، أو كائن يسمّي رمزًا مميّزًا في `provide` ويحدد كيف تُنشأ قيمته:

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

تنشئ `token<T>(description)` رمزًا مميّزًا مُنمَّطًا لقيمة ليست صنفًا. والصنف هو رمزه المميّز نفسه. وعندما تسرد وحدة الرمز نفسه مرتين، يفوز المدخل الأخير.

يستقبل factory الرموز المسرودة في `inject` كمعاملات، وقد يكون غير متزامن:

```ts
const DatabaseUrl = token<string>('DatabaseUrl');
const Database = token<{ close(): Promise<void> }>('Database');

export const database: Provider[] = [
  { provide: DatabaseUrl, useValue: 'postgres://localhost/app' },
  { provide: Database, useFactory: (url: string) => connect(url), inject: [DatabaseUrl] },
];
```

يستقر كل factory قبل إنشاء أي صنف، ولذلك تستطيع الأصناف حقن قيمة factory مباشرة. أما الصنف الذي يحتاج إليه factory أثناء بنائه فلا يمكنه حقن سوى factories استقرت بالفعل؛ اسرد هذه الاعتمادية في مصفوفة `inject` الخاصة بالـ factory ليستقر أولًا ([VIBE9106](https://vibejs.org/v0/errors/VIBE9106)).

## خطافات دورة الحياة {#lifecycle-hooks}

يمكن لصنف مزوِّد أو متحكم أو معزّز (enhancer) أو وحدة أن ينفّذ هذه الخطافات:

| الخطاف                           | الوقت                                                   |
| -------------------------------- | ------------------------------------------------------- |
| `onModuleInit()`                 | بعد إنشاء كل كائن، بترتيب الوحدات (الأعمق استيرادًا أولًا). |
| `onApplicationBootstrap()`       | بعد كل `onModuleInit`.                                  |
| `onModuleDestroy()`              | عند `close()`، بالترتيب العكسي.                         |
| `onApplicationShutdown(signal?)` | بعد كل `onModuleDestroy`.                               |

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

تُنتظر خطافات التهيئة واحدًا تلو الآخر، ويوقف أول خطأ بدء التشغيل. أما خطافات الإيقاف فتعمل كلها حتى لو فشل أحدها؛ وتُبلَّغ حالات الفشل معًا بالرمز [VIBE9204](https://vibejs.org/v0/errors/VIBE9204).
