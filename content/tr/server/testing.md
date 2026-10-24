# Sunucuyu test etmek

Sunucu testleri aynı process içinde çalışır: port yok, ağ yok. `@usevibejs/server/testing` içindeki `Test.createTestingModule()`, listelediğin modüllerden production'dakiyle aynı `App` nesnesini kurar. İstekleri de `app.fetch` karşılar.

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

`createTestingModule()` modül seçeneklerini (`imports`, `providers`, `controllers`) ve uygulama seçeneklerini (`basePath`, `logger`, `guards`, …) tek bir nesnede alır. Production seçenekleriyle test etmek istiyorsan `app.module.ts` dosyasındaki `appOptions` nesnesini spread et.

Rotaları `createClient` üzerinden çağırırsan sözleşmeyi de denetlemiş olursun. Bir rota, bir girdi ya da bir yanıt tipi değişirse test derlenmez. Sonucu UI'da yaptığın gibi daralt:

```ts
const api = createClient({ todos }, { baseUrl: '/api', fetch: app.fetch });
const removed = await api.todos.remove({ params: { id: 'missing' } });
if (removed.ok || removed.error.code !== 'TODO_NOT_FOUND') throw new Error('expected a 404');
expect(removed.error.status).toBe(404);
```

Eksik bir rota ya da bozuk bir body gibi sözleşme dışındaki istekler için `app.request(path, init?)` kullan. `init.json` bir JSON body gönderir.

## Provider'ları değiştirmek {#replacing-providers}

`overrideProvider(token)`, daha hiçbir şey oluşmadan bir provider'ı, onu provide eden her modülde token'ına göre değiştirir:

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

`useValue`, `useClass` ve `useFactory` kullanabilirsin. Hiçbir modülün provide etmediği bir token'ı override etmeye çalışırsan [VIBE9701](https://vibejs.org/v0/errors/VIBE9701) hatası alırsın. `app.get(token)` bir provider'ı okur. Örneğin testin durumunu kontrol ettiği bir servisi böyle alırsın.

## Loglar {#logs}

Test çıktısını temiz tutmak için `logger: new JsonLogger({ level: 'silent' })` ver. Log kayıtları üzerinde assert yapmak istiyorsan `write` fonksiyonu olan bir `JsonLogger` ver. Framework'ün kendi istek, hata ve yaşam döngüsü logları bu logger'a gider. `Logger` override edersen sadece onu inject eden koda ulaşırsın.

## Grafiği kontrol etmek {#checking-the-graph}

`inspect(root, options)` hiçbir şey oluşturmadan rotaları ve modülleri listeler. Bunun bir snapshot'ı, istemeden yapılmış bir rota, guard ya da modül değişikliğini yakalar:

```ts
expect(inspect(AppModule, appOptions)).toMatchSnapshot();
```
