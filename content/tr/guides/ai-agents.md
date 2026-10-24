# CLI ve yapay zekâ ajanları

Her `vibejs` komutu insanlar için de kodlama ajanları için de aynı şekilde çalışır. Ajana tek bir JSON nesnesiyle cevap verir: ne olduğunu ve sırada ne yapması gerektiğini söyler. Hiçbir zaman soru sormaz. Dokümanları da kurulu sürümün içinde gelir.

## Ajan modu {#agent-mode}

`vibejs`, ortam değişkenlerinden tanıdığı bir kodlama ajanının içinde çalışıyorsa ya da `VIBEJS_AGENT=1` tanımlıysa ajan moduna geçer. `VIBEJS_AGENT=0` bu modu kapatır. Ajan modu olmadan aynı çıktıyı almak için `--json` kullan.

Ajan modunda bir komut:

- stdout'a tek bir JSON nesnesi yazar (`vibejs dev` her satıra bir JSON olayı yazar);
- hiçbir zaman soru sormaz ve izin almadan hiçbir dosyanın üstüne yazmaz;
- çıktısını kısa tutar, uzun listeleri sınırlar.

## Sonuçlar ve çıkış kodları {#results-and-exit-codes}

Her sonuç aynı zarfla gelir:

```ts
interface JsonEnvelope {
  ok: boolean;
  command: string;
  version: string;
  /** Commands to run next. */
  next?: string[];
  error?: {
    code: string;
    message: string;
    /** The docs page of the code. */
    docs: string;
    fixes?: string[];
    /** The inputs that a command needs and did not get. */
    missing?: { name: string; flag?: string; values?: string[]; example: string }[];
  };
}
```

Bir komutun çıkış kodları:

| Kod | Anlamı                                     |
| --- | ------------------------------------------ |
| `0` | Başarılı.                                  |
| `1` | İş başarısız oldu, örneğin bir denetim.    |
| `2` | Yanlış kullanım ya da yanlış yapılandırma. |

`vibejs check --json` çıktıya `diagnostics` ekler. Her birinde `source` (`tsc`, `oxlint`, `oxfmt`, `vitest`, `coverage` veya `vibejs`), `code`, `severity`, `file`, `loc` (`file:line:column`) ve `message` bulunur. vibe.js kodlarında ayrıca `docs` linki ve `fixes` de vardır. `.vibe` dosyalarındaki şablon hatalarını da `.vibe` dosyasında bulundukları yerde raporlar.

## AGENTS.md {#agentsmd}

Yeni bir uygulamada bir `AGENTS.md` ve bir `CLAUDE.md` gelir. `AGENTS.md` içinde iki işaret satırının arasında bir vibe.js kuralları bloğu var, `CLAUDE.md` de onu `@AGENTS.md` ile içeri alır. Blokta şunlar bulunur:

- uygulamanın kendi CLI'ı üzerinden çalıştırılacak birebir komutlar;
- ajanların bir vibe.js uygulamasında en sık yanlış yaptığı kurallar;
- `node_modules/@usevibejs/cli/dist/docs` altındaki dokümanların tek satırlık dizini. Böylece ajan hatırladıklarına değil, kurulu sürümün dokümanına bakar.

```sh
vibejs agents sync
vibejs agents sync --check
```

`vibejs agents sync` bloğu kurulu sürüme göre yeniden yazar. `vibejs dev` de başlarken aynısını yapar. `--check` hiçbir şey yazmaz; bir dosya güncel değilse hata verir. Kendi notlarını işaretlerin dışına yazarsan onlara dokunulmaz. İşaretler bozuksa senkronizasyon [VIBE8601](https://vibejs.org/v0/errors/VIBE8601) ile durur.

## Çevrimdışı dokümanlar ve hatalar {#docs-and-errors-offline}

Her `VIBE####` hatası kodunu, çözümlerini ve sayfasının linkini taşır. CLI, içinde paketlediği dokümanlardan cevap verir, ağa ihtiyacı yok:

```sh
vibejs explain VIBE8601
vibejs docs guides/tutorial
vibejs docs template type error
```

`vibejs explain` bir kodun mesajını, çözümlerini ve linkini yazdırır. `vibejs docs` bir kod, bir sayfa yolu ya da arama kelimeleri alır.

## Geliştirme sunucusu {#the-dev-server}

`vibejs dev` durumunu `.vibejs/dev.lock` dosyasına yazar. Build'in, tarayıcının ve sunucunun her hata ve log satırını da `.vibejs/dev.log` dosyasına yazar. İkinci bir `vibejs dev` yeni bir sunucu başlatmaz, çalışan sunucuyu bildirir. Sunucu çalışırken:

- `vibejs errors` güncel build hatalarını ve son çalışma zamanı hatalarını listeler;
- `vibejs logs` son log kayıtlarını gösterir; seviyeye, kaynağa, metne ya da zamana göre süzebilirsin;
- `vibejs request GET /api/users` bir rotayı çalışan sunucu üzerinden çağırır, sunucu yoksa aynı süreç içinde çağırır;
- `vibejs di` sunucunun modüllerini ve provider'larını gösterir.

`vibejs routes` API rotalarını ve UI rotalarını listeler. `vibejs components` da `.vibe` bileşenlerini prop'ları, modelleri ve tip argümanlarıyla listeler. İkisi de çalışan bir geliştirme sunucusu istemez.

## MCP {#mcp}

`vibejs mcp`, komutları bir ajana stdio üzerinden [MCP](https://modelcontextprotocol.io) araçları olarak sunar. Her araç, karşılığı olan `--json` komutu gibi cevap verir:

| Araç                 | Komut                                         |
| -------------------- | --------------------------------------------- |
| `get_errors`         | `vibejs errors`                               |
| `get_logs`           | `vibejs logs`                                 |
| `get_routes`         | `vibejs routes`                               |
| `get_di_graph`       | `vibejs di`                                   |
| `get_component_tree` | `vibejs components`                           |
| `check`              | `vibejs check`                                |
| `request`            | `vibejs request`                              |
| `explain`            | `vibejs docs`: bir kod, bir sayfa ya da arama |

`--read-only` ile `request` aracı yalnızca `GET`, `HEAD` ve `OPTIONS` kabul eder.

## Başvuru {#reference}

[CLI başvurusu](https://vibejs.org/v0/cli/) her komutu seçenekleri ve örnekleriyle listeler. `vibejs <command> --help --json` aynı başvuruyu JSON olarak döner.
