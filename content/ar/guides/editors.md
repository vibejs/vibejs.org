# إعداد المحرر

تُفحَص أنواع ملفات `.vibe` بواسطة خادم لغة TypeScript 7 (`tsc --lsp`). يحمّل الخادم `@usevibejs/language-tools` الخاصة بالمشروع، وهي مُحوِّل محتوى (content mapper) يحوّل كل ملف `.vibe` إلى TypeScript، ويعيد كل إجابة إلى موضعها الدقيق في ملف `.vibe`. تعمل خاصية التمرير (hover) والانتقال إلى التعريف وإيجاد المراجع وإعادة التسمية والإكمال والتشخيصات في كتلة `<script setup>` وفي تعابير القالب.

يحتاج كل محرر إلى الأشياء الثلاثة نفسها:

- مدخل `contentMappers` في ملف tsconfig الذي يضم ملفات `.vibe` (يوجد في كل تطبيق جديد):

  ```json
  {
    "contentMappers": [{ "package": "@usevibejs/language-tools", "extensions": [".vibe"] }]
  }
  ```

- وجود `node` في `PATH` الخاص بالمحرر، لأن الخادم يشغّل به مُحوِّل المحتوى؛
- إذن بتشغيل شيفرة المشروع. مُحوِّل المحتوى هو شيفرة من المشروع، لذا لا يشغّله الخادم إلا إذا مرّر المحرر `runExternalCode: true` في خيارات التهيئة. فعّله فقط للمشاريع التي تثق بها.

افتح جذر التطبيق، أي المجلد الذي يحتوي `node_modules`، ليجد الخادم `@usevibejs/language-tools`.

## VS Code {#vs-code}

ثبّت إضافتين (يوصي كل تطبيق جديد بهما في `.vscode/extensions.json`):

- **vibe.js** (`vibejs.vibejs`): تلوين الصياغة وقواعد التحرير لملفات `.vibe`، وتسليم ملفات `.vibe` إلى إضافة TypeScript 7؛
- **TypeScript 7** (`TypeScriptTeam.native-preview`): خادم اللغة.

لا يشغّل VS Code شيفرة المشروع إلا في مساحة عمل موثوقة. في الوضع المقيّد (Restricted Mode) تُلوَّن ملفات `.vibe` لكن لا تُفحَص أنواعها، وتعرض إضافة vibe.js الرمز [VIBE6102](https://vibejs.org/v0/errors/VIBE6102). ثق بالمجلد لتفعيل فحص الأنواع.

## Neovim {#neovim}

Neovim 0.11 أو أحدث، مع عميل LSP المدمج:

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

يشغّل `init_options = { runExternalCode = true }` مُحوِّل محتوى المشروع: احتفظ بهذا الإعداد للمشاريع التي تثق بها. تشغّل مجموعة اختبارات vibe.js خادم اللغة بهذا الأمر نفسه وهذه الخيارات تمامًا.

## محررات LSP الأخرى {#other-lsp-editors}

يستخدم Zed وHelix والمحررات الأخرى التي لها عميل LSP الإعداد نفسه:

- الأمر `node_modules/.bin/tsc --lsp --stdio`؛
- خيارات التهيئة `{ "runExternalCode": true }`؛
- نوع ملف `vibejs` للامتداد `.vibe`، يُسلَّم إلى ذلك الخادم.

بيئات JetBrains غير مدعومة: فهي لا تحمّل مُحوِّلات محتوى TypeScript.

## القيود المعروفة {#known-limitations}

تأتي هذه القيود من خادم لغة TypeScript وتُتابَع في المشروع الأصلي.

- **إعادة التسمية من السكربت لا تحدّث القالب** ([#63879](https://github.com/microsoft/TypeScript/issues/63879)). تعديل اسم رابط (binding) في `<script setup>` يغيّر السكربت فقط؛ ويبقى القالب بالاسم القديم، ويبلّغ فحص الأنواع التالي عنه. استخدم إيجاد المراجع أولًا، أو البحث والاستبدال داخل الملف. ويُرفَض تغيير اسم وسم أو مفتاح prop أو اسم حدث في القالب.
- **إكمال الاستيراد التلقائي** ([#64119](https://github.com/microsoft/TypeScript/issues/64119)). لا يقترح الإكمال في ملف `.vibe` الصادرات التي لم يستوردها الملف بعد. اكتب `import` بنفسك، أو أكمل الاسم في ملف `.ts` وانسخ الاستيراد.
- **التنسيق** ([#64579](https://github.com/microsoft/TypeScript/issues/64579)). لا ينسّق خادم اللغة ملفات `.vibe`. نسّقها بمنسّق التطبيق: يبلّغ `vibejs check` عن مشاكل التنسيق.

## استكشاف الأخطاء {#troubleshooting}

| المشكلة                                                                                                           | الحل                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VIBE6101](https://vibejs.org/v0/errors/VIBE6101): إضافة TypeScript 7 غير موجودة.                                 | ثبّت `TypeScriptTeam.native-preview` وأعد تحميل النافذة.                                                                                                          |
| [VIBE6102](https://vibejs.org/v0/errors/VIBE6102): مساحة العمل غير موثوقة.                                        | ثق بالمجلد. في الوضع المقيّد تكون إضافة TypeScript 7 معطّلة، فتُلوَّن ملفات `.vibe` فقط.                                                                              |
| [VIBE6002](https://vibejs.org/v0/errors/VIBE6002): مضيف TypeScript لا يوفّر مواضع UTF-16.                           | حدّث `typescript` إلى الإصدار الذي تدعمه `@usevibejs/language-tools`.                                                                                              |
| [VIBE6010](https://vibejs.org/v0/errors/VIBE6010): التعليق `<!-- @vibe-expect-error -->` لا يخفي أي خطأ في الأنواع. | احذف التعليق، أو انقله قبل العنصر أو الاستيفاء الذي يتوقع خطأه مباشرة.                                                                                            |
| TS18068: تتطلب مُحوِّلات المحتوى الخيار `--runExternalCode`.                                                          | شغّل `tsc -b --runExternalCode` (يمرّره `vibejs check`). في المحرر، مرّر `runExternalCode: true` في خيارات التهيئة.                                                 |
| TS18099: لم يبدأ مُحوِّل المحتوى.                                                                                    | شغّل `pnpm install` ليكون `@usevibejs/language-tools` وبناؤه في `node_modules`، وتأكد من أن المحرر يجد `node` في `PATH`.                                          |
| TS18080: مشكلة في الشيفرة التي أنتجها مُحوِّل المحتوى.                                                               | يتحول ملف `.vibe` إلى TypeScript غير صالح، وهذا خلل في vibe.js. بلّغ عنه مع الملف على [github.com/vibejs/vibejs/issues](https://github.com/vibejs/vibejs/issues). |
| لا تتغير التشخيصات بعد ربط بناء محلي من `@usevibejs/language-tools`.                                               | يخزّن TypeScript ناتج مُحوِّل المحتوى مؤقتًا حسب إصدار الحزمة. شغّل `tsc -b --force` مرة واحدة، وأعد تشغيل خادم اللغة.                                                 |
