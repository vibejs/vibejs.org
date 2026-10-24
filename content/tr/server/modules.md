# Modüller ve provider'lar

## Modüller {#modules}

Modül, `@Module()` ile işaretlenmiş bir sınıftır. Neleri sağladığını, hangi controller'ları kaydettiğini, hangi modülleri içe aktardığını ve provider'larından hangilerini diğer modüllerin kullanabileceğini listeler:

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

Bir modül kendi provider'larını, içe aktardığı modüllerin export'larını ve global modüllerin export'larını görür. Bunların dışındaki her şey başlangıçta, modülü ve token'ı isteyen zinciri adlandıran [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) ile başarısız olur. Modüller döngü oluşturacak şekilde birbirini içe aktaramaz ([VIBE9202](https://vibejs.org/v0/errors/VIBE9202)) ve içe aktarılan her sınıfın kendi `@Module()` bildirimi olmalıdır ([VIBE9201](https://vibejs.org/v0/errors/VIBE9201)).

Bir modül, içe aktardığı bir modülü export edebilir; bu, o modülün export'larını kendi içe aktaranlarına iletir. `@Module({ global: true })`, export'ları içe aktarma olmadan her yerde görünür kılar; veritabanı istemcisi gibi kesişen (cross-cutting) servisler için kullanın.

## Bağımlılıkları enjekte etmek {#injecting-dependencies}

Bağımlılıklar, `inject(Token)` ile başlatılan alanlardır:

```ts
class TodosService {
  private readonly db = inject(Db);

  list(): string[] {
    return this.db.query('select * from todos');
  }
}
```

- Provider'lar `new Cls()` ile oluşturulur. Parametreli bir constructor [VIBE9104](https://vibejs.org/v0/errors/VIBE9104) ile reddedilir; her parametreyi bir `inject()` alanına taşıyın.
- `inject()`, container bir nesneyi oluştururken çalışır: alan başlatıcılarında, constructor gövdesinde ve bir factory'nin eşzamanlı kısmında. Başka her yerde [VIBE9101](https://vibejs.org/v0/errors/VIBE9101) hatası fırlatır.
- Enjekte edilen alanları `private` yapın. Public bir alan sınıfın bildirilen türünün parçasıdır; bu yüzden `isolatedDeclarations` ile açık bir tür notasyonu gerekir (TS9012): `readonly db: Db = inject(Db)`.
- `inject(Token, { optional: true })`, görünür bir provider yoksa `undefined` döndürür.

## Provider'lar {#providers}

Provider, bir sınıf ya da `provide` içinde bir token adlandıran ve değerinin nasıl oluşturulacağını söyleyen bir nesnedir:

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

`token<T>(description)`, sınıf olmayan bir değer için tipli bir token oluşturur. Sınıf kendi token'ıdır. Bir modül aynı token'ı iki kez listelerse son kayıt kazanır.

Bir factory, `inject` içinde listelenen token'ları parametre olarak alır ve async olabilir:

```ts
const DatabaseUrl = token<string>('DatabaseUrl');
const Database = token<{ close(): Promise<void> }>('Database');

export const database: Provider[] = [
  { provide: DatabaseUrl, useValue: 'postgres://localhost/app' },
  { provide: Database, useFactory: (url: string) => connect(url), inject: [DatabaseUrl] },
];
```

Her factory, herhangi bir sınıf oluşturulmadan önce tamamlanır; bu yüzden sınıflar bir factory'nin değerini doğrudan enjekte edebilir. Bir factory oluşturulurken ihtiyaç duyduğu bir sınıf yalnızca tamamlanmış factory'leri enjekte edebilir; böyle bir bağımlılığı, önce tamamlansın diye factory'nin `inject` dizisinde listeleyin ([VIBE9106](https://vibejs.org/v0/errors/VIBE9106)).

## Lifecycle hook'ları {#lifecycle-hooks}

Bir provider, controller, enhancer ya da modül sınıfı şu hook'ları uygulayabilir:

| Hook                             | Ne zaman                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `onModuleInit()`                 | Her nesne oluşturulduktan sonra, modül sırasıyla (en derin içe aktarma önce). |
| `onApplicationBootstrap()`       | Her `onModuleInit` sonrasında.                                                |
| `onModuleDestroy()`              | `close()` sırasında, ters sırayla.                                            |
| `onApplicationShutdown(signal?)` | Her `onModuleDestroy` sonrasında.                                             |

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

Init hook'ları tek tek await edilir ve ilk hata başlangıcı durdurur. Shutdown hook'larının hepsi, biri başarısız olsa bile çalışır; hatalar birlikte [VIBE9204](https://vibejs.org/v0/errors/VIBE9204) olarak bildirilir.
