# Editör kurulumu

`.vibe` dosyaları TypeScript 7 dil sunucusu (`tsc --lsp`) ile tip denetiminden geçer. Sunucu, projenin `@usevibejs/language-tools` paketini yükler; bu paket her `.vibe` dosyasını TypeScript'e çeviren bir içerik eşleyicisidir (content mapper) ve her yanıtı `.vibe` dosyasındaki tam konuma geri eşler. Hover, tanıma gitme, referans bulma, yeniden adlandırma, tamamlama ve tanılamalar `<script setup>` bloğunda ve template ifadelerinde çalışır.

Her editörün aynı üç şeye ihtiyacı vardır:

- `.vibe` dosyalarını içeren tsconfig'deki `contentMappers` girdisi (yeni bir uygulamada bulunur):

  ```json
  {
    "contentMappers": [{ "package": "@usevibejs/language-tools", "extensions": [".vibe"] }]
  }
  ```

- editörün `PATH` değişkeninde `node`, çünkü sunucu içerik eşleyicisini onunla başlatır;
- proje kodunu çalıştırma izni. İçerik eşleyici proje kodudur; bu yüzden sunucu onu yalnızca editör başlatma seçeneklerinde `runExternalCode: true` geçtiğinde çalıştırır. Bunu yalnızca güvendiğiniz projeler için etkinleştirin.

Sunucunun `@usevibejs/language-tools` paketini bulabilmesi için uygulamanın kök klasörünü, yani `node_modules` içeren klasörü açın.

## VS Code {#vs-code}

İki eklenti kurun (yeni bir uygulama ikisini de `.vscode/extensions.json` içinde önerir):

- **vibe.js** (`vibejs.vibejs`): `.vibe` dosyaları için vurgulama ve düzenleme kuralları ile `.vibe` dosyalarının TypeScript 7 eklentisine devredilmesi;
- **TypeScript 7** (`TypeScriptTeam.native-preview`): dil sunucusu.

VS Code proje kodunu yalnızca güvenilen (trusted) bir çalışma alanında çalıştırır. Kısıtlı Modda (Restricted Mode) `.vibe` dosyaları vurgulanır ama tip denetimine girmez ve vibe.js eklentisi [VIBE6102](https://vibejs.org/v0/errors/VIBE6102) gösterir. Tip denetimini açmak için klasöre güvenin.

## Neovim {#neovim}

Yerleşik LSP istemcisiyle Neovim 0.11 veya üzeri:

```lua
vim.filetype.add({ extension = { vibe = 'vibejs' } })
vim.lsp.config('tsc', {
  cmd = { 'node_modules/.bin/tsc', '--lsp', '--stdio' },
  init_options = { runExternalCode = true },
  filetypes = { 'typescript', 'typescriptreact', 'javascript', 'javascriptreact', 'vibejs' },
  root_markers = { 'tsconfig.json', 'package.json' },
})
vim.lsp.enable('tsc')
```

`init_options = { runExternalCode = true }` projenin içerik eşleyicisini çalıştırır: bu yapılandırmayı yalnızca güvendiğiniz projelerde kullanın. vibe.js test paketi dil sunucusunu tam olarak bu komut ve bu seçeneklerle başlatır.

## Diğer LSP editörleri {#other-lsp-editors}

Zed, Helix ve LSP istemcisi olan diğer editörler aynı kurulumu kullanır:

- `node_modules/.bin/tsc --lsp --stdio` komutu;
- `{ "runExternalCode": true }` başlatma seçenekleri;
- `.vibe` uzantısı için, o sunucuya devredilen `vibejs` dosya türü.

JetBrains IDE'leri desteklenmez: TypeScript içerik eşleyicilerini yüklemezler.

## Bilinen sınırlamalar {#known-limitations}

Bunlar TypeScript dil sunucusundan gelir ve upstream'de takip edilir.

- **Script içinden yeniden adlandırma template'i güncellemez** ([#63879](https://github.com/microsoft/TypeScript/issues/63879)). Bir `<script setup>` bağlamasını yeniden adlandırmak yalnızca script'i düzenler; template eski adı korur ve sonraki tip denetimi bunu bildirir. Önce referans bulmayı kullanın veya dosyada ara-değiştir yapın. Template'teki bir etiketi, prop anahtarını veya olay adını yeniden adlandırma reddedilir.
- **Otomatik import tamamlamaları** ([#64119](https://github.com/microsoft/TypeScript/issues/64119)). Bir `.vibe` dosyasındaki tamamlama, dosyanın henüz import etmediği export'ları önermez. `import` satırını kendiniz yazın veya adı bir `.ts` dosyasında tamamlayıp import'u kopyalayın.
- **Biçimlendirme** ([#64579](https://github.com/microsoft/TypeScript/issues/64579)). Dil sunucusu `.vibe` dosyalarını biçimlendirmez. Bunları uygulamanın biçimlendiricisiyle biçimlendirin: `vibejs check` biçimlendirme sorunlarını bildirir.

## Sorun giderme {#troubleshooting}

| Sorun                                                                                                                 | Çözüm                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [VIBE6101](https://vibejs.org/v0/errors/VIBE6101): TypeScript 7 eklentisi eksik.                                      | `TypeScriptTeam.native-preview` eklentisini kurun ve pencereyi yeniden yükleyin.                                                                                                           |
| [VIBE6102](https://vibejs.org/v0/errors/VIBE6102): çalışma alanı güvenilir değil.                                     | Klasöre güvenin. Kısıtlı Modda TypeScript 7 eklentisi kapalıdır; bu yüzden `.vibe` dosyaları yalnızca vurgulanır.                                                                          |
| [VIBE6002](https://vibejs.org/v0/errors/VIBE6002): TypeScript ana bilgisayarı UTF-16 konumları sunmuyor.              | `typescript` paketini `@usevibejs/language-tools` paketinin desteklediği sürüme güncelleyin.                                                                                               |
| [VIBE6010](https://vibejs.org/v0/errors/VIBE6010): bir `<!-- @vibe-expect-error -->` hiçbir tip hatasını bastırmıyor. | Yorumu kaldırın veya hatasını beklediği öğenin ya da interpolasyonun hemen önüne taşıyın.                                                                                                  |
| TS18068: içerik eşleyiciler `--runExternalCode` gerektirir.                                                           | `tsc -b --runExternalCode` çalıştırın (`vibejs check` bunu geçirir). Bir editörde başlatma seçeneklerinde `runExternalCode: true` geçin.                                                   |
| TS18099: içerik eşleyici başlamadı.                                                                                   | `@usevibejs/language-tools` ve build çıktısının `node_modules` içinde olması için `pnpm install` çalıştırın ve editörün `node` komutunu `PATH` içinde bulduğundan emin olun.               |
| TS18080: içerik eşleyicinin ürettiği kodda bir sorun var.                                                             | `.vibe` dosyası geçersiz TypeScript'e eşleniyor; bu bir vibe.js hatasıdır. Dosyayla birlikte [github.com/vibejs/vibejs/issues](https://github.com/vibejs/vibejs/issues) adresine bildirin. |
| `@usevibejs/language-tools` paketinin yerel bir build'ini bağladıktan sonra tanılamalar değişmiyor.                   | TypeScript, içerik eşleyicinin çıktısını paket sürümüne göre önbelleğe alır. Bir kez `tsc -b --force` çalıştırın ve dil sunucusunu yeniden başlatın.                                       |
