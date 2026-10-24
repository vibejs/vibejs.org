# سطر الأوامر ووكلاء الذكاء الاصطناعي

كل أوامر `vibejs` تعمل بالطريقة نفسها مع الناس ومع وكلاء البرمجة. حين يشغّلها وكيل، تردّ بكائن JSON واحد يخبره بما حدث وبما يفعله بعد ذلك، ولا تطرح عليه أسئلة أبدًا، ووثائقها مرفقة بالإصدار المثبّت.

## وضع الوكيل {#agent-mode}

ينتقل `vibejs` إلى وضع الوكيل حين يعمل داخل وكيل برمجة معروف، ويكتشف ذلك من متغيرات البيئة، أو حين تضبط `VIBEJS_AGENT=1`. أما `VIBEJS_AGENT=0` فيوقفه. ويعطيك `--json` المخرجات نفسها دون وضع الوكيل.

في وضع الوكيل، الأمر:

- يطبع كائن JSON واحدًا إلى stdout (أما `vibejs dev` فيطبع حدث JSON واحدًا في كل سطر)؛
- لا يطرح أسئلة أبدًا، ولا يكتب فوق ملف دون موافقة؛
- يُبقي مخرجاته قصيرة، ويضع حدًّا لطول القوائم الطويلة.

## النتائج ورموز الخروج {#results-and-exit-codes}

لكل نتيجة الغلاف نفسه:

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

ينتهي الأمر بأحد هذه الرموز:

| الرمز | المعنى                        |
| ----- | ----------------------------- |
| `0`   | نجاح.                         |
| `1`   | فشل العمل نفسه، كفحص لم ينجح. |
| `2`   | استخدام أو إعداد خاطئ.        |

يضيف `vibejs check --json` الحقل `diagnostics`. في كل تشخيص مصدره `source` (`tsc` أو `oxlint` أو `oxfmt` أو `vitest` أو `coverage` أو `vibejs`)، و`code`، و`severity`، و`file`، و`loc` (`file:line:column`)، و`message`. وإذا كان الرمز من رموز vibe.js أضيف إليه رابط `docs` وقائمة `fixes`. أخطاء القوالب في ملفات `.vibe` تظهر في موضعها من ملف `.vibe` نفسه.

## AGENTS.md {#agentsmd}

في التطبيق الجديد ملف `AGENTS.md` فيه كتلة من قواعد vibe.js بين سطرَي علامة، وملف `CLAUDE.md` يستورده عبر `@AGENTS.md`. تحتوي الكتلة على:

- الأوامر التي تُشغَّل بنصّها الدقيق، عبر أداة سطر الأوامر الخاصة بالتطبيق؛
- القواعد التي يخطئ فيها الوكلاء أكثر من غيرها في تطبيقات vibe.js؛
- فهرس من سطر واحد للوثائق في `node_modules/@usevibejs/cli/dist/docs`، ليقرأ الوكيل وثائق الإصدار المثبّت بدل الاعتماد على ما يتذكره.

```sh
vibejs agents sync
vibejs agents sync --check
```

يعيد `vibejs agents sync` كتابة الكتلة لتطابق الإصدار المثبّت، ويفعل `vibejs dev` الشيء نفسه عند بدئه. أما `--check` فلا يكتب شيئًا، ويفشل إذا كان أحد الملفات قديمًا. ملاحظاتك الخاصة تكتبها خارج العلامات فتبقى كما هي. وإذا كانت العلامات تالفة توقفت المزامنة بالخطأ [VIBE8601](https://vibejs.org/v0/errors/VIBE8601).

## الوثائق والأخطاء دون اتصال {#docs-and-errors-offline}

كل خطأ `VIBE####` يحمل رمزه وطرق إصلاحه ورابطًا إلى صفحته. وتجيب أداة سطر الأوامر من الوثائق المضمّنة فيها، دون حاجة إلى الشبكة:

```sh
vibejs explain VIBE8601
vibejs docs guides/tutorial
vibejs docs template type error
```

يطبع `vibejs explain` رسالة الرمز وطرق إصلاحه ورابطه. ويقبل `vibejs docs` رمزًا أو مسار صفحة أو كلمات بحث.

## خادم التطوير {#the-dev-server}

يكتب `vibejs dev` حالته في `.vibejs/dev.lock`، ويكتب كل خطأ وكل سطر سجل من البناء والمتصفح والخادم في `.vibejs/dev.log`. وإن شغّلت `vibejs dev` مرة ثانية أخبرك بالخادم الذي يعمل بدل أن يشغّل خادمًا آخر. أثناء عمله:

- يعرض `vibejs errors` أخطاء البناء الحالية وآخر أخطاء وقت التشغيل؛
- يعرض `vibejs logs` آخر مدخلات السجل، مع تصفيتها حسب المستوى أو المصدر أو النص أو الوقت؛
- يستدعي `vibejs request GET /api/users` مسارًا عبر الخادم الذي يعمل، أو داخل العملية نفسها إن لم يكن هناك خادم يعمل؛
- يعرض `vibejs di` وحدات الخادم ومزوّداته.

يعرض `vibejs routes` مسارات الـ API ومسارات الواجهة، ويعرض `vibejs components` مكوّنات `.vibe` مع خصائصها (props) ونماذجها (models) ومعاملات أنواعها. ولا يحتاج أيٌّ منهما إلى خادم تطوير يعمل.

## MCP {#mcp}

يقدّم `vibejs mcp` الأوامر إلى الوكيل على شكل أدوات [MCP](https://modelcontextprotocol.io) عبر stdio. كل أداة تردّ كما يردّ أمرها مع `--json`:

| الأداة                | الأمر                              |
| -------------------- | --------------------------------- |
| `get_errors`         | `vibejs errors`                   |
| `get_logs`           | `vibejs logs`                     |
| `get_routes`         | `vibejs routes`                   |
| `get_di_graph`       | `vibejs di`                       |
| `get_component_tree` | `vibejs components`               |
| `check`              | `vibejs check`                    |
| `request`            | `vibejs request`                  |
| `explain`            | `vibejs docs`: رمز أو صفحة أو بحث |

مع `--read-only` لا تقبل أداة `request` إلا `GET` و`HEAD` و`OPTIONS`.

## المرجع {#reference}

يسرد [مرجع سطر الأوامر](https://vibejs.org/v0/cli/) كل الأوامر مع خياراتها وأمثلتها، ويعيد `vibejs <command> --help --json` المرجع نفسه بصيغة JSON.
