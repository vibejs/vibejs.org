# Başlarken

Bir vibe.js uygulaması tek bir paket ve üç parçadan oluşur: UI, sunucu ve ikisinin arasındaki sözleşmeler (contract). Uygulamayı tek komutla oluşturursun, hepsini de tek komutla denetlersin.

## Gereksinimler {#requirements}

- Node.js `^24.15.0 || >=26`.
- Bir paket yöneticisi: pnpm, npm, yarn ya da bun. Örnekler pnpm ile.

## Uygulama oluştur {#create-an-app}

```sh
pnpm create vibejs my-app
cd my-app
```

Başka bir paket yöneticisi kullanıyorsan `npm create vibejs@latest my-app`, `yarn create vibejs my-app` ya da `bun create vibejs my-app` çalıştır. Scaffolder, bağımlılıkları onu hangi paket yöneticisiyle çalıştırdıysan onunla kurar.

## Proje yapısı {#project-layout}

| Yol          | İçinde ne var                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `contracts/` | API sözleşmeleri: parametreleri, gövdeleri, yanıtları ve hatalarıyla rotalar. UI ve sunucu bunları ortak kullanır. |
| `server/`    | Sunucu: modüller, sözleşmeleri sunan controller'lar ve servisler.                                                  |
| `ui/`        | UI: `.vibe` bileşenleri, sayfalar, rotalar ve tipli API istemcisi.                                                 |
| `AGENTS.md`  | Kodlama ajanları için kurallar ve doküman dizini.                                                                  |

## Çalıştır {#run-it}

```sh
pnpm dev
```

`pnpm dev`, UI'ı ve API'yi aynı portta sunar; API `/api` altındadır. Yazdırdığı adresi aç: ana sayfa, `/api/health` adresinden çektiği durumu gösterir. UI'da bir şey değiştirirsen sayfa yerinde yenilenir, sunucuda değiştirirsen sunucu yeniden başlar.

## Denetle {#check-it}

```sh
pnpm vibejs check
```

`vibejs check` tek seferde TypeScript'in ve `.vibe` şablonlarının tipini denetler, lint'ten geçirir, formatı kontrol eder ve testleri coverage ile çalıştırır. Her şey geçerse 0 ile çıkar. Sorun bulursa her birini dosyası, satırı, sütunu ve dokümanının linkiyle yazar.

## Editör kurulumu {#editor-setup}

Uygulamanın `.vscode/extensions.json` dosyasında önerdiği VS Code eklentilerini kur:

- **vibe.js** (`vibejs.vibejs`): `.vibe` dosyalarında söz dizimi renklendirme, tip denetimi, hover ve tanıma gitme.
- **TypeScript 7** (`TypeScriptTeam.native-preview`): `.vibe` dosyalarını uygulamadaki `@usevibejs/language-tools` üzerinden denetleyen TypeScript dil servisi.
- **Oxc** (`oxc.oxc-vscode`): kaydederken lint ve format.

Tip denetimi projenin kodunu çalıştırır, o yüzden çalışma alanına güvenmen (trusted workspace) gerekir. TypeScript 7 eklentisi yoksa ya da çalışma alanına güvenmediysen editör [VIBE6101](https://vibejs.org/v0/errors/VIBE6101) veya [VIBE6102](https://vibejs.org/v0/errors/VIBE6102) gösterir, renklendirme yine çalışır.

Neovim ve diğer editörler, bilinen kısıtlar ve sorun giderme için [Editör kurulumu](https://vibejs.org/v0/guides/editors) sayfasına bak.

## Kodlama ajanları {#coding-agents}

`AGENTS.md` içinde kodlama ajanları için bir vibe.js kuralları bloğu var. Blokta birebir komutlar, ajanların en sık yanlış yaptığı kurallar ve uygulamayla `node_modules/@usevibejs/cli/dist/docs` altında gelen dokümanların dizini bulunur. Böylece ajan, kurulu sürümün dokümanını okur. `vibejs agents sync` ve `vibejs dev` bu bloğu güncel tutar. Kendi notlarını bloğun işaretlerinin dışına yaz. Ayrıntılar için [CLI ve yapay zekâ ajanları](https://vibejs.org/v0/guides/ai-agents).

## Sonraki adım {#next}

Bir API kaynağı ve onu gösteren bir sayfa eklemek için [eğitimi](https://vibejs.org/v0/guides/tutorial) takip et.
