# Translating vibejs.org

The Turkish and Arabic pages are localized, not translated word for word. Write the page the way a developer who speaks the language would explain it to a colleague: same facts, same structure, natural sentences. If a sentence sounds translated, rewrite it.

## Rules for every language

- Keep the facts and the Markdown structure: the same headings in the same order, lists, tables and links. Never change code blocks, inline code, URLs, file paths, package, API and CLI names, `VIBE####` codes or the name vibe.js.
- Every `##` and `###` heading ends with ` {#id}`, the slug of the English heading (lowercase, drop characters other than letters, digits, `_`, spaces and `-`, spaces to `-`; repeats get `-1`, `-2`). Links into the page keep working that way.
- Short sentences, active voice, concrete verbs. Split a long English sentence in two rather than chaining clauses.
- Do not add or remove information, and do not add marketing tone the English does not have.
- Prefer rephrasing to suffixing English words. When an English term stays, introduce it once and keep it.

## Turkish

- Address the reader as **sen** (`çalıştır`, `eklersen`, `görürsün`), the way Turkish developer blogs and talks do.
- Avoid the translated-document tells: `-mektedir/-maktadır`, `gerçekleştirmek`, `sağlamak` as a filler verb, `bu sayede`, `ile birlikte`, `olarak` chains, `söz konusu`, `ilgili`, passive voice (`kullanılır` → `kullanırsın` when a person does it).
- Use everyday developer Turkish: `çalıştır`, `derle`, `dene`, `bak`, `ekle`, `sil`, `değiştir`, `hata verir`, `patlar` (only in casual asides).
- Glossary:

| English                                  | Turkish                                     |
| ---------------------------------------- | ------------------------------------------- |
| component                                | bileşen                                     |
| template (prose)                         | şablon (`<template>` stays)                 |
| contract                                 | sözleşme (first use: "sözleşme (contract)") |
| route / routing / router                 | rota / yönlendirme / router                 |
| handler                                  | handler                                     |
| provider, guard, interceptor, middleware | provider, guard, interceptor, middleware    |
| props, slot, ref, computed, watcher      | prop, slot, ref, computed, watcher          |
| reactive / reactivity                    | reaktif / reaktivite                        |
| state                                    | durum                                       |
| type-check                               | tip denetimi, tipini denetlemek             |
| build (noun) / build (verb)              | build / build almak, derlemek               |
| error code                               | hata kodu                                   |
| coding agent                             | kodlama ajanı                               |

- Before / after: `Bu fonksiyon, bileşenin mount edilmesiyle birlikte çalıştırılmaktadır.` → `Bu fonksiyon bileşen sayfaya yerleşince çalışır.`

## Arabic

- Modern Standard Arabic as Arab developers write it: direct and clear, not literary. Address the reader with the masculine singular imperative that technical Arabic uses (`شغّل`، `أضف`).
- Avoid the translated-document tells: `يتم` + verbal noun (`يتم تحديث` → `يتحدّث`), long chains of `الذي/التي`, calqued English word order, `قم بـ` + verbal noun (`قم بإضافة` → `أضف`), stacked diacritics (only where a word would be misread).
- Arabic punctuation (`،` `؛` `؟`), Western digits, and Latin script for code, APIs and product names.
- Glossary:

| English                             | Arabic                                                  |
| ----------------------------------- | ------------------------------------------------------- |
| component                           | مكوّن                                                    |
| template                            | قالب                                                    |
| contract                            | عقد                                                     |
| route / routing / router            | مسار / التوجيه / الموجِّه                                 |
| server / client                     | خادم / عميل                                             |
| state                               | حالة                                                    |
| reactive / reactivity               | تفاعلي / التفاعلية                                      |
| props, slot, ref, computed, watcher | الخصائص (props)، slot، ref، computed، المراقِب (watcher) |
| handler                             | معالج                                                   |
| middleware, guard, interceptor      | middleware، guard، interceptor                          |
| type-check                          | التحقق من الأنواع                                        |
| build                               | البناء                                                  |
| error code                          | رمز الخطأ                                               |
| coding agent                        | وكيل برمجة                                              |

- Before / after: `يتم استدعاء الدالة عند القيام بتحميل المكوّن.` → `تُستدعى الدالة عند تحميل المكوّن.`
