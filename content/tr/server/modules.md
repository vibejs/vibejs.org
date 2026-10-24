# Modüller ve provider'lar

## Modüller {#modules}

Modül, `@Module()` ile işaretlenmiş bir class'tır. Neleri provide ettiğini, hangi controller'ları kaydettiğini, hangi modülleri import ettiğini ve provider'larından hangilerini başka modüllerin kullanabileceğini listeler:

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

Bir modül kendi provider'larını, import ettiği modüllerin export'larını ve global modüllerin export'larını görür. Başka bir şey isterse uygulama açılırken [VIBE9102](https://vibejs.org/v0/errors/VIBE9102) hatası verir. Hata, modülün ismini ve token'ı isteyen zinciri gösterir. Modüller birbirini döngüsel olarak import edemez ([VIBE9202](https://vibejs.org/v0/errors/VIBE9202)). Import edilen her class'ın da kendi `@Module()` decorator'ı olmalı ([VIBE9201](https://vibejs.org/v0/errors/VIBE9201)).

Bir modül, import ettiği bir modülü export edebilir. O zaman o modülün export'ları, onu import eden modüllere de geçer. `@Module({ global: true })` export'ları import gerektirmeden her yerde görünür yapar. Bunu veritabanı istemcisi gibi her yerde gereken servisler için kullan.

## Bağımlılıkları inject etmek {#injecting-dependencies}

Bağımlılıklar, `inject(Token)` ile başlatılan field'lardır:

```ts
class TodosService {
  private readonly db = inject(Db);

  list(): string[] {
    return this.db.query('select * from todos');
  }
}
```

- Provider'lar `new Cls()` ile oluşturulur. Parametre alan bir constructor yazarsan [VIBE9104](https://vibejs.org/v0/errors/VIBE9104) hatası alırsın. Her parametreyi bir `inject()` field'ına taşı.
- `inject()`, container bir nesneyi kurarken çalışır: field initializer'larında, constructor gövdesinde ve bir factory'nin senkron kısmında. Başka bir yerde [VIBE9101](https://vibejs.org/v0/errors/VIBE9101) fırlatır.
- Inject ettiğin field'ları `private` yap. Public bir field class'ın tanımlı tipinin parçasıdır. Bu yüzden `isolatedDeclarations` açıksa ona açık bir tip yazman gerekir (TS9012): `readonly db: Db = inject(Db)`.
- `inject(Token, { optional: true })`, görünür bir provider yoksa `undefined` döner.

## Provider'lar {#providers}

Provider ya bir class'tır ya da `provide` içinde bir token veren ve değerinin nasıl oluşturulacağını söyleyen bir nesnedir:

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

`token<T>(description)`, class olmayan bir değer için tipli bir token oluşturur. Class zaten kendi token'ıdır. Bir modül aynı token'ı iki kere listelerse son kayıt kazanır.

Factory, `inject` içinde listelenen token'ları parametre olarak alır ve async olabilir:

```ts
const DatabaseUrl = token<string>('DatabaseUrl');
const Database = token<{ close(): Promise<void> }>('Database');

export const database: Provider[] = [
  { provide: DatabaseUrl, useValue: 'postgres://localhost/app' },
  { provide: Database, useFactory: (url: string) => connect(url), inject: [DatabaseUrl] },
];
```

Hiçbir class oluşmadan önce bütün factory'ler tamamlanır. Bu yüzden class'lar bir factory'nin değerini doğrudan inject edebilir. Bir factory'nin kurulurken ihtiyaç duyduğu bir class ise sadece önceden tamamlanmış factory'leri inject edebilir. Böyle bir bağımlılığı önce tamamlanması için factory'nin `inject` dizisine yaz ([VIBE9106](https://vibejs.org/v0/errors/VIBE9106)).

## Yaşam döngüsü hook'ları {#lifecycle-hooks}

Bir provider, controller, enhancer ya da modül class'ı şu hook'ları uygulayabilir:

| Hook                             | Ne zaman                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `onModuleInit()`                 | Bütün nesneler oluştuktan sonra, modül sırasıyla (en derindeki import önce). |
| `onApplicationBootstrap()`       | Bütün `onModuleInit` hook'larından sonra.                                    |
| `onModuleDestroy()`              | `close()` sırasında, ters sırayla.                                           |
| `onApplicationShutdown(signal?)` | Bütün `onModuleDestroy` hook'larından sonra.                                 |

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

Init hook'ları tek tek await edilir ve ilk hata açılışı durdurur. Kapanış hook'ları ise biri başarısız olsa bile hepsi çalışır. Hatalar topluca [VIBE9204](https://vibejs.org/v0/errors/VIBE9204) olarak raporlanır.
