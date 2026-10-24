# Editör kurulumu

`.vibe` dosyalarının tipini TypeScript 7 dil sunucusu (`tsc --lsp`) denetler. Sunucu, projedeki `@usevibejs/language-tools` paketini yükler. Bu paket bir content mapper: her `.vibe` dosyasını TypeScript'e çevirir ve gelen her yanıtı `.vibe` dosyasındaki tam konuma geri eşler. Hover, tanıma gitme, referansları bulma, yeniden adlandırma, tamamlama ve hata mesajları hem `<script setup>` bloğunda hem de şablon ifadelerinde çalışır.

Hangi editörü kullanırsan kullan aynı üç şey gerekiyor:

- `.vibe` dosyalarını kapsayan tsconfig'de `contentMappers` girdisi (yeni uygulamada zaten var):

  ```json
  {
    "contentMappers": [{ "package": "@usevibejs/language-tools", "extensions": [".vibe"] }]
  }
  ```

- editörün `PATH`'inde `node`, çünkü sunucu content mapper'ı onunla başlatıyor;
- proje kodunu çalıştırma izni. Content mapper proje kodudur. Sunucu onu ancak editör başlangıç seçeneklerinde `runExternalCode: true` geçerse çalıştırır. Bunu yalnızca güvendiğin projelerde aç.

Sunucunun `@usevibejs/language-tools` paketini bulabilmesi için uygulamanın kök klasörünü, yani `node_modules` klasörünün olduğu yeri aç.

## VS Code {#vs-code}

İki eklenti kur (yeni bir uygulama ikisini de `.vscode/extensions.json` içinde önerir):

- **vibe.js** (`vibejs.vibejs`): `.vibe` dosyaları için renklendirme ve düzenleme kuralları; ayrıca `.vibe` dosyalarını TypeScript 7 eklentisine devreder;
- **TypeScript 7** (`TypeScriptTeam.native-preview`): dil sunucusu.

VS Code proje kodunu yalnızca güvenilen bir çalışma alanında (trusted workspace) çalıştırır. Restricted Mode'da `.vibe` dosyaları renklenir ama tip denetiminden geçmez; vibe.js eklentisi de [VIBE6102](https://vibejs.org/v0/errors/VIBE6102) gösterir. Tip denetimini açmak için klasöre güven.

## Neovim {#neovim}

Neovim 0.11 veya sonrası, yerleşik LSP istemcisiyle:

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

`init_options = { runExternalCode = true }` projenin content mapper'ını çalıştırır. Bu yapılandırmayı güvendiğin projelerde kullan. vibe.js test paketi dil sunucusunu tam olarak bu komut ve bu seçeneklerle başlatıyor.

## Diğer LSP editörleri {#other-lsp-editors}

Zed, Helix ve LSP istemcisi olan diğer editörlerde kurulum aynı:

- komut: `node_modules/.bin/tsc --lsp --stdio`;
- başlangıç seçenekleri: `{ "runExternalCode": true }`;
- `.vibe` uzantısı için bir `vibejs` dosya tipi; bu tipi aynı sunucuya ver.

JetBrains IDE'leri desteklenmiyor, çünkü TypeScript content mapper'larını yüklemiyorlar.

## Bilinen kısıtlar {#known-limitations}

Bunlar TypeScript dil sunucusundan geliyor ve upstream'de takip ediliyor.

- **Script'te yeniden adlandırma şablonu güncellemiyor** ([#63879](https://github.com/microsoft/TypeScript/issues/63879)). `<script setup>` içindeki bir binding'i yeniden adlandırırsan yalnızca script değişir. Şablonda eski ad kalır ve bir sonraki tip denetimi bunu hata olarak gösterir. Önce referansları bul ya da dosyada bul-değiştir yap. Şablonda bir etiketi, prop anahtarını veya olay adını yeniden adlandırmaya kalkarsan sunucu bunu reddeder.
- **Otomatik import önerileri** ([#64119](https://github.com/microsoft/TypeScript/issues/64119)). `.vibe` dosyasında tamamlama, dosyanın henüz import etmediği export'ları önermez. `import` satırını kendin yaz ya da adı bir `.ts` dosyasında tamamlayıp import'u kopyala.
- **Formatlama** ([#64579](https://github.com/microsoft/TypeScript/issues/64579)). Dil sunucusu `.vibe` dosyalarını formatlamaz. Onları uygulamanın formatter'ıyla formatla: `vibejs check` format sorunlarını raporlar.

## Sorun giderme {#troubleshooting}

| Sorun                                                                                                                 | Çözüm                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VIBE6101](https://vibejs.org/v0/errors/VIBE6101): TypeScript 7 eklentisi kurulu değil.                               | `TypeScriptTeam.native-preview` eklentisini kur ve pencereyi yeniden yükle.                                                                                                              |
| [VIBE6102](https://vibejs.org/v0/errors/VIBE6102): çalışma alanı güvenilir değil.                                     | Klasöre güven. Restricted Mode'da TypeScript 7 eklentisi kapalıdır, o yüzden `.vibe` dosyaları yalnızca renklendirilir.                                                                  |
| [VIBE6002](https://vibejs.org/v0/errors/VIBE6002): TypeScript host'u UTF-16 konumları sunmuyor.                       | `typescript` paketini `@usevibejs/language-tools`'un desteklediği sürüme güncelle.                                                                                                       |
| [VIBE6010](https://vibejs.org/v0/errors/VIBE6010): bir `<!-- @vibe-expect-error -->` hiçbir tip hatasını bastırmıyor. | Yorumu sil ya da beklediği hatanın olduğu elemanın veya interpolasyonun hemen önüne taşı.                                                                                                |
| TS18068: content mapper'lar `--runExternalCode` istiyor.                                                              | `tsc -b --runExternalCode` çalıştır (`vibejs check` bunu zaten geçiyor). Editörde başlangıç seçeneklerine `runExternalCode: true` ekle.                                                  |
| TS18099: content mapper başlamadı.                                                                                    | `@usevibejs/language-tools` ve build'i `node_modules` içine gelsin diye `pnpm install` çalıştır. Editörün `PATH` üzerinde `node`'u bulduğundan emin ol.                                  |
| TS18080: content mapper'ın ürettiği kodda bir sorun var.                                                              | `.vibe` dosyası geçersiz TypeScript'e dönüşüyor; bu bir vibe.js hatası. Dosyayı da ekleyerek [github.com/vibejs/vibejs/issues](https://github.com/vibejs/vibejs/issues) adresine bildir. |
| `@usevibejs/language-tools`'un yerel bir build'ini bağladıktan sonra hata mesajları değişmiyor.                       | TypeScript, content mapper'ın çıktısını paket sürümüne göre önbelleğe alır. Bir kez `tsc -b --force` çalıştır ve dil sunucusunu yeniden başlat.                                          |
