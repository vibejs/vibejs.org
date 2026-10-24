# إعداد المحرر

خادم لغة TypeScript 7 (`tsc --lsp`) هو الذي يتحقق من الأنواع في ملفات `.vibe`. يحمّل الخادم `@usevibejs/language-tools` من المشروع، وهو محوّل محتوى (content mapper) يحوّل كل ملف `.vibe` إلى TypeScript، ثم يعيد كل إجابة إلى موضعها الدقيق في ملف `.vibe`. التلميحات عند التمرير، والانتقال إلى التعريف، والبحث عن المراجع، وإعادة التسمية، والإكمال التلقائي، والتشخيصات كلها تعمل في كتلة `<script setup>` وفي تعابير القالب.

كل محرر يحتاج إلى الأمور الثلاثة نفسها:

- مدخل `contentMappers` في ملف tsconfig الذي يضم ملفات `.vibe` (التطبيق الجديد يأتي به جاهزًا):

  ```json
  {
    "contentMappers": [{ "package": "@usevibejs/language-tools", "extensions": [".vibe"] }]
  }
  ```

- وجود `node` في `PATH` الخاص بالمحرر، لأن الخادم يشغّل محوّل المحتوى به؛
- إذن بتشغيل كود المشروع. محوّل المحتوى جزء من كود المشروع، لذا لا يشغّله الخادم إلا إذا مرّر المحرر `runExternalCode: true` في خيارات التهيئة. فعّل ذلك للمشاريع التي تثق بها فقط.

افتح جذر التطبيق، أي المجلد الذي فيه `node_modules`، كي يجد الخادم `@usevibejs/language-tools`.

## VS Code {#vs-code}

ثبّت إضافتين (التطبيق الجديد يوصي بكلتيهما في `.vscode/extensions.json`):

- **vibe.js** (`vibejs.vibejs`): التلوين وقواعد التحرير لملفات `.vibe`، وتسليم ملفات `.vibe` إلى إضافة TypeScript 7؛
- **TypeScript 7** (`TypeScriptTeam.native-preview`): خادم اللغة.

لا يشغّل VS Code كود المشروع إلا في مساحة عمل موثوقة. في الوضع المقيّد (Restricted Mode) تُلوَّن ملفات `.vibe` لكن لا يجري التحقق من أنواعها، وتعرض إضافة vibe.js الرمز [VIBE6102](https://vibejs.org/v0/errors/VIBE6102). امنح المجلد الثقة ليعمل التحقق من الأنواع.

## Neovim {#neovim}

يلزمك Neovim 0.11 أو أحدث، مع عميل LSP المدمج فيه:

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

السطر `init_options = { runExternalCode = true }` يشغّل محوّل المحتوى الخاص بالمشروع، فاحصر هذا الإعداد في المشاريع التي تثق بها. مجموعة اختبارات vibe.js تشغّل خادم اللغة بهذا الأمر وهذه الخيارات حرفيًا.

## محررات LSP الأخرى {#other-lsp-editors}

Zed وHelix وغيرهما من المحررات التي فيها عميل LSP تستخدم الإعداد نفسه:

- الأمر `node_modules/.bin/tsc --lsp --stdio`؛
- خيارات التهيئة `{ "runExternalCode": true }`؛
- نوع ملف `vibejs` لامتداد `.vibe`، يُسلَّم إلى ذلك الخادم.

بيئات JetBrains غير مدعومة، لأنها لا تحمّل محوّلات المحتوى في TypeScript.

## القيود المعروفة {#known-limitations}

مصدر هذه القيود خادم لغة TypeScript نفسه، وهي مسجّلة لدى فريقه.

- **إعادة التسمية من السكربت لا تحدّث القالب** ([#63879](https://github.com/microsoft/TypeScript/issues/63879)). إذا أعدت تسمية متغير في `<script setup>` تغيّر السكربت وحده، وبقي الاسم القديم في القالب، فيبلّغ عنه التحقق التالي من الأنواع. ابحث عن المراجع أولًا، أو استخدم البحث والاستبدال داخل الملف. أما إعادة تسمية وسم أو مفتاح خاصية أو اسم حدث في القالب فمرفوضة.
- **الإكمال مع الاستيراد التلقائي** ([#64119](https://github.com/microsoft/TypeScript/issues/64119)). لا يقترح الإكمال في ملف `.vibe` عناصر لم يستوردها الملف بعد. اكتب `import` بنفسك، أو أكمل الاسم في ملف `.ts` وانسخ سطر الاستيراد.
- **التنسيق** ([#64579](https://github.com/microsoft/TypeScript/issues/64579)). خادم اللغة لا ينسّق ملفات `.vibe`. نسّقها بأداة التنسيق في التطبيق، ويبلّغ `vibejs check` عن مشكلات التنسيق.

## حل المشكلات {#troubleshooting}

| المشكلة                                                                                                     | الحل                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VIBE6101](https://vibejs.org/v0/errors/VIBE6101): إضافة TypeScript 7 غير مثبّتة.                            | ثبّت `TypeScriptTeam.native-preview` وأعد تحميل النافذة.                                                                                                          |
| [VIBE6102](https://vibejs.org/v0/errors/VIBE6102): مساحة العمل غير موثوقة.                                  | امنح المجلد الثقة. في الوضع المقيّد تكون إضافة TypeScript 7 معطّلة، فتُلوَّن ملفات `.vibe` فقط.                                                                       |
| [VIBE6002](https://vibejs.org/v0/errors/VIBE6002): مضيف TypeScript لا يوفّر مواضع UTF-16.                     | حدّث `typescript` إلى الإصدار الذي يدعمه `@usevibejs/language-tools`.                                                                                              |
| [VIBE6010](https://vibejs.org/v0/errors/VIBE6010): تعليق `<!-- @vibe-expect-error -->` لا يكتم أي خطأ أنواع. | احذف التعليق، أو انقله إلى ما قبل العنصر أو الإقحام (interpolation) الذي يتوقع خطأه مباشرة.                                                                       |
| TS18068: محوّلات المحتوى تتطلب `--runExternalCode`.                                                           | شغّل `tsc -b --runExternalCode` (يمرّره `vibejs check` تلقائيًا). وفي المحرر مرّر `runExternalCode: true` في خيارات التهيئة.                                         |
| TS18099: محوّل المحتوى لم يبدأ.                                                                              | شغّل `pnpm install` ليكون `@usevibejs/language-tools` وناتج بنائه في `node_modules`، وتأكد أن المحرر يجد `node` في `PATH`.                                        |
| TS18080: مشكلة في الكود الذي أنتجه محوّل المحتوى.                                                            | ملف `.vibe` يتحوّل إلى TypeScript غير صالح، وهذا خلل في vibe.js. أبلغ عنه مع الملف في [github.com/vibejs/vibejs/issues](https://github.com/vibejs/vibejs/issues). |
| التشخيصات لا تتغير بعد ربط نسخة محلية مبنية من `@usevibejs/language-tools`.                                  | يخزّن TypeScript ناتج محوّل المحتوى مؤقتًا حسب إصدار الحزمة. شغّل `tsc -b --force` مرة واحدة، ثم أعد تشغيل خادم اللغة.                                               |
