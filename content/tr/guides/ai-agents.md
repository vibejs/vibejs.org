# CLI ve yapay zekâ ajanları

Her `vibejs` komutu insanlar ve kodlama ajanları için aynı şekilde çalışır. Bir ajan için ne olduğunu ve sırada ne yapılacağını söyleyen tek bir JSON nesnesiyle yanıt verir, asla soru sormaz ve dokümanları kurulu sürümle birlikte gelir.

## Ajan modu {#agent-mode}

`vibejs`, bilinen bir kodlama ajanının içinde çalıştığında (ortamdan algılanır) veya `VIBEJS_AGENT=1` ayarlandığında ajan moduna geçer. `VIBEJS_AGENT=0` bunu kapatır. `--json` aynı çıktıyı ajan modu olmadan verir.

Ajan modunda bir komut:

- stdout'a tek bir JSON nesnesi yazdırır (`vibejs dev` satır başına bir JSON olayı yazdırır);
- asla soru sormaz ve izin olmadan hiçbir dosyanın üzerine yazmaz;
- çıktısını kısa tutar; uzun listelerde sınır uygular.

## Sonuçlar ve çıkış kodları {#results-and-exit-codes}

Her sonucun zarfı (envelope) aynıdır:

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

Bir komut şu kodlarla çıkar:

| Kod | Anlamı                                |
| --- | ------------------------------------- |
| `0` | Başarılı.                             |
| `1` | İş başarısız oldu, örneğin bir check. |
| `2` | Yanlış kullanım veya yapılandırma.    |

`vibejs check --json` çıktıya `diagnostics` ekler: her birinin `source` (`tsc`, `oxlint`, `oxfmt`, `vitest`, `coverage` veya `vibejs`), `code`, `severity`, `file`, `loc` (`file:line:column`) ve `message` alanları vardır; vibe.js kodları için ayrıca `docs` bağlantısı ve `fixes` bulunur. `.vibe` dosyalarındaki template hataları, `.vibe` dosyasındaki yerlerinde bildirilir.

## AGENTS.md {#agentsmd}

Yeni bir uygulamada, iki işaretçi satırı arasında bir vibe.js kuralları bloğu içeren bir `AGENTS.md` ve onu `@AGENTS.md` ile içe aktaran bir `CLAUDE.md` bulunur. Blok şunları içerir:

- uygulamanın kendi CLI'ı üzerinden çalıştırılacak tam komutlar;
- ajanların bir vibe.js uygulamasında en sık yanlış yaptığı kurallar;
- `node_modules/@usevibejs/cli/dist/docs` içindeki dokümanların tek satırlık bir dizini; böylece ajan, hatırladığı şeyi değil kurulu sürümün dokümanlarını okur.

```sh
vibejs agents sync
vibejs agents sync --check
```

`vibejs agents sync` bloğu kurulu sürüm için yeniden yazar; `vibejs dev` de başlarken aynısını yapar. `--check` hiçbir şey yazmaz ve bir dosya güncel değilse başarısız olur. Kendi notlarınız işaretçilerin dışında kalır ve korunur. Hatalı işaretçiler eşitlemeyi [VIBE8601](https://vibejs.org/v0/errors/VIBE8601) ile durdurur.

## Çevrimdışı dokümanlar ve hatalar {#docs-and-errors-offline}

Her `VIBE####` hatası kodunu, çözümlerini ve sayfasına bir bağlantıyı taşır. CLI, ağa ihtiyaç duymadan, içine gömdüğü dokümanlardan yanıt verir:

```sh
vibejs explain VIBE8601
vibejs docs guides/tutorial
vibejs docs template type error
```

`vibejs explain` bir kodun mesajını, çözümlerini ve bağlantısını yazdırır. `vibejs docs` bir kod, bir sayfa yolu veya arama sözcükleri alır.

## Dev server {#the-dev-server}

`vibejs dev` durumunu `.vibejs/dev.lock` dosyasına, build'in, tarayıcının ve sunucunun her hata ve log satırını da `.vibejs/dev.log` dosyasına yazar. İkinci bir `vibejs dev`, yeni bir sunucu başlatmak yerine çalışan sunucuyu bildirir. Çalışırken:

- `vibejs errors` güncel build hatalarını ve en son çalışma zamanı hatalarını listeler;
- `vibejs logs` en son log kayıtlarını düzeye, kaynağa, metne veya zamana göre filtreleyerek gösterir;
- `vibejs request GET /api/users` bir rotayı çalışan sunucu üzerinden, hiçbiri çalışmıyorsa süreç içinde çağırır;
- `vibejs di` sunucunun modüllerini ve provider'larını gösterir.

`vibejs routes` API rotalarını ve UI rotalarını, `vibejs components` ise `.vibe` bileşenlerini prop'ları, model'leri ve tip argümanlarıyla listeler. İkisi de çalışan bir dev server gerektirmez.

## MCP {#mcp}

`vibejs mcp`, komutları bir ajana stdio üzerinden [MCP](https://modelcontextprotocol.io) araçları olarak sunar. Her araç, kendi `--json` komutu gibi yanıt verir:

| Araç                 | Komut                                        |
| -------------------- | -------------------------------------------- |
| `get_errors`         | `vibejs errors`                              |
| `get_logs`           | `vibejs logs`                                |
| `get_routes`         | `vibejs routes`                              |
| `get_di_graph`       | `vibejs di`                                  |
| `get_component_tree` | `vibejs components`                          |
| `check`              | `vibejs check`                               |
| `request`            | `vibejs request`                             |
| `explain`            | `vibejs docs`: bir kod, bir sayfa veya arama |

`--read-only` ile `request` aracı yalnızca `GET`, `HEAD` ve `OPTIONS` kabul eder.

## Başvuru {#reference}

[CLI başvurusu](https://vibejs.org/v0/cli/) her komutu seçenekleri ve örnekleriyle listeler; `vibejs <command> --help --json` aynı başvuruyu JSON olarak döndürür.
