# Sunucuyu test etmek

Sunucu testleri süreç içinde çalışır: port yok, ağ yok. `@usevibejs/server/testing` içindeki `Test.createTestingModule()`, listelediğiniz modüllerden production ile aynı `App` nesnesini oluşturur ve istekleri `app.fetch` karşılar.

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

`createTestingModule()` modül seçeneklerini (`imports`, `providers`, `controllers`) ve uygulama seçeneklerini (`basePath`, `logger`, `guards`, …) tek bir nesnede alır. Production seçenekleriyle test etmek için `app.module.ts` içindeki `appOptions` değerini yayın (spread).

Route'ları `createClient` üzerinden çağırmak contract'ı da denetler: bir route, girdi ya da yanıt türü değiştiğinde test derlenemez. Sonucu UI'ın yaptığı gibi daraltın:

```ts
const api = createClient({ todos }, { baseUrl: '/api', fetch: app.fetch });
const removed = await api.todos.remove({ params: { id: 'missing' } });
if (removed.ok || removed.error.code !== 'TODO_NOT_FOUND') throw new Error('expected a 404');
expect(removed.error.status).toBe(404);
```

Eksik bir route ya da hatalı biçimli bir gövde gibi bir contract dışındaki istekler için `app.request(path, init?)` kullanın; `init.json` bir JSON gövdesi gönderir.

## Provider'ları değiştirmek {#replacing-providers}

`overrideProvider(token)`, hiçbir şey oluşturulmadan önce, bir provider'ı onu sağlayan her modülde token'ına göre değiştirir:

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

`useValue`, `useClass` ve `useFactory` kullanılabilir. Hiçbir modülün sağlamadığı bir token'ı değiştirmek [VIBE9701](https://vibejs.org/v0/errors/VIBE9701) ile başarısız olur. `app.get(token)`, durumu bir testin denetlediği bir servis gibi bir provider'ı okur.

## Loglar {#logs}

Test çıktısını temiz tutmak için `logger: new JsonLogger({ level: 'silent' })` verin; log kayıtları üzerinde doğrulama yapmak için `write` fonksiyonlu bir `JsonLogger` verin. Framework'ün kendi istek, hata ve lifecycle logları bu logger'a gider; `Logger` değerini değiştirmek yalnızca onu enjekte eden koda ulaşır.

## Grafiği denetlemek {#checking-the-graph}

`inspect(root, options)`, hiçbir şey oluşturmadan route'ları ve modülleri listeler. Bunun bir snapshot'ı, istenmeyen bir route, guard ya da modül değişikliğini yakalar:

```ts
expect(inspect(AppModule, appOptions)).toMatchSnapshot();
```
