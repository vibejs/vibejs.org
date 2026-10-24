# Başlarken

Bir vibe.js uygulaması tek bir paketten oluşur ve üç parçası vardır: UI, sunucu ve ikisi arasındaki contract'lar. Tek bir komut uygulamayı oluşturur, tek bir komut da hepsini denetler.

## Gereksinimler {#requirements}

- Node.js `^24.15.0 || >=26`.
- Bir paket yöneticisi: pnpm, npm, yarn veya bun. Örneklerde pnpm kullanılır.

## Uygulama oluşturma {#create-an-app}

```sh
pnpm create vibejs my-app
cd my-app
```

Başka bir paket yöneticisiyle `npm create vibejs@latest my-app`, `yarn create vibejs my-app` veya `bun create vibejs my-app` komutunu çalıştırın. İskele aracı (scaffolder) bağımlılıkları, kendisini çalıştıran paket yöneticisiyle kurar.

## Proje yapısı {#project-layout}

| Yol          | İçeriği                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `contracts/` | API contract'ları: parametreleri, gövdeleri, yanıtları ve hatalarıyla rotalar. UI ve sunucu bunları paylaşır. |
| `server/`    | Sunucu: modüller, contract'lara hizmet eden controller'lar ve servisler.                                      |
| `ui/`        | UI: `.vibe` bileşenleri, sayfalar, rotalar ve tipli API istemcisi.                                            |
| `AGENTS.md`  | Kodlama ajanları için kurallar ve doküman dizini.                                                             |

## Çalıştırma {#run-it}

```sh
pnpm dev
```

`pnpm dev` UI'ı ve API'yi tek bir portta sunar; API `/api` altındadır. Yazdırdığı URL'yi açın: ana sayfa, `/api/health` adresinden yüklediği durumu gösterir. UI değişiklikleri yerinde yeniden yüklenir, sunucu değişiklikleri sunucuyu yeniden başlatır.

## Denetleme {#check-it}

```sh
pnpm vibejs check
```

`vibejs check` TypeScript'i ve `.vibe` template'lerini tip denetiminden geçirir, lint yapar, biçimlendirmeyi denetler ve testleri kapsama (coverage) ile çalıştırır; hepsini bir arada. Her şey geçerse 0 koduyla çıkar, her sorunu dosyası, satırı, sütunu ve dokümanına bir bağlantıyla birlikte yazdırır.

## Editör kurulumu {#editor-setup}

Uygulamanın `.vscode/extensions.json` dosyasında listelediği önerilen VS Code eklentilerini kurun:

- **vibe.js** (`vibejs.vibejs`): sözdizimi vurgulama; `.vibe` dosyalarında tip denetimi, hover ve tanıma gitme.
- **TypeScript 7** (`TypeScriptTeam.native-preview`): `.vibe` dosyalarını uygulamanın `@usevibejs/language-tools` paketi üzerinden denetleyen TypeScript dil servisi.
- **Oxc** (`oxc.oxc-vscode`): kaydederken lint ve biçimlendirme.

Tip denetimi proje kodunu çalıştırdığı için güvenilen (trusted) bir çalışma alanı gerektirir. TypeScript 7 eklentisi veya güven olmadan editör [VIBE6101](https://vibejs.org/v0/errors/VIBE6101) veya [VIBE6102](https://vibejs.org/v0/errors/VIBE6102) gösterir ve vurgulamayı sürdürür.

Neovim ve diğer editörler, bilinen sınırlamalar ve sorun giderme için [Editör kurulumu](https://vibejs.org/v0/guides/editors) sayfasına bakın.

## Kodlama ajanları {#coding-agents}

`AGENTS.md`, kodlama ajanları için bir vibe.js kuralları bloğu içerir: tam komutlar, ajanların en sık yanlış yaptığı kurallar ve uygulamayla birlikte gelen, `node_modules/@usevibejs/cli/dist/docs` içindeki dokümanların bir dizini. Böylece ajan, kurulu sürümün dokümanlarını okur. `vibejs agents sync` ve `vibejs dev` bloğu güncel tutar; kendi notlarınızı işaretçilerin dışına yazın. Bkz. [CLI ve yapay zekâ ajanları](https://vibejs.org/v0/guides/ai-agents).

## Sonraki adım {#next}

Bir API kaynağı ve onu gösteren bir sayfa eklemek için [eğitimi](https://vibejs.org/v0/guides/tutorial) izleyin.
