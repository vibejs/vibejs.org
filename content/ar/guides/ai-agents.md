# سطر الأوامر ووكلاء الذكاء الاصطناعي

يعمل كل أمر من أوامر `vibejs` بالطريقة نفسها للناس ولوكلاء البرمجة. فللوكيل، يجيب بكائن JSON واحد يقول ما حدث وما يجب فعله بعده، ولا يطرح أسئلة أبدًا، وتأتي وثائقه مع الإصدار المثبّت.

## وضع الوكيل {#agent-mode}

يتحول `vibejs` إلى وضع الوكيل عندما يعمل داخل وكيل برمجة معروف يُكتشف من البيئة، أو عند ضبط `VIBEJS_AGENT=1`. ويعطّله `VIBEJS_AGENT=0`. ويعطي `--json` المخرجات نفسها دون وضع الوكيل.

في وضع الوكيل، يقوم الأمر بما يلي:

- يطبع كائن JSON واحدًا إلى stdout (ويطبع `vibejs dev` حدث JSON واحدًا في كل سطر)؛
- لا يطرح أسئلة أبدًا، ولا يكتب فوق ملف دون موافقة؛
- يُبقي مخرجاته قصيرة، مع حدود على القوائم الطويلة.

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

ينتهي الأمر برمز من هذه الرموز:

| الرمز | المعنى                   |
| ----- | ------------------------ |
| `0`   | نجاح.                    |
| `1`   | فشل العمل، كما في الفحص. |
| `2`   | استخدام أو إعداد خاطئ.   |

يضيف `vibejs check --json` الحقل `diagnostics`: لكل تشخيص `source` (وهو `tsc` أو `oxlint` أو `oxfmt` أو `vitest` أو `coverage` أو `vibejs`) و`code` و`severity` و`file` و`loc` (بصيغة `file:line:column`) و`message`، ولرموز vibe.js أيضًا رابط `docs` و`fixes`. تُعرَض أخطاء القوالب في ملفات `.vibe` عند موضعها في ملف `.vibe`.

## AGENTS.md {#agentsmd}

في كل تطبيق جديد ملف `AGENTS.md` فيه كتلة من قواعد vibe.js بين سطري علامتين، وملف `CLAUDE.md` يستورده بـ `@AGENTS.md`. تحتوي الكتلة على:

- الأوامر الدقيقة التي يجب تشغيلها، عبر سطر أوامر التطبيق نفسه؛
- القواعد التي يخطئ فيها الوكلاء أكثر من غيرها في تطبيق vibe.js؛
- فهرس من سطر واحد للوثائق في `node_modules/@usevibejs/cli/dist/docs`، ليقرأ الوكيل وثائق الإصدار المثبّت بدلًا مما يتذكره.

```sh
vibejs agents sync
vibejs agents sync --check
```

يعيد `vibejs agents sync` كتابة الكتلة للإصدار المثبّت، ويفعل `vibejs dev` الأمر نفسه عند بدئه. لا يكتب `--check` شيئًا ويفشل عندما يكون ملف قديمًا. تُكتب ملاحظاتك الخاصة خارج العلامات وتبقى محفوظة. وتوقف العلامات المشوّهة المزامنة بالرمز [VIBE8601](https://vibejs.org/v0/errors/VIBE8601).

## الوثائق والأخطاء دون اتصال {#docs-and-errors-offline}

يحمل كل خطأ `VIBE####` رمزه وحلوله ورابط صفحته. يجيب سطر الأوامر من الوثائق المضمّنة فيه، دون شبكة:

```sh
vibejs explain VIBE8601
vibejs docs guides/tutorial
vibejs docs template type error
```

يطبع `vibejs explain` رسالة الرمز وحلوله ورابطه. ويقبل `vibejs docs` رمزًا أو مسار صفحة أو كلمات بحث.

## خادم التطوير {#the-dev-server}

يكتب `vibejs dev` حالته في `.vibejs/dev.lock`، ويكتب كل خطأ وسطر سجل من البناء والمتصفح والخادم في `.vibejs/dev.log`. ويُبلغ أمر `vibejs dev` ثانٍ عن الخادم العامل بدلًا من تشغيل خادم آخر. وأثناء عمله:

- يسرد `vibejs errors` أخطاء البناء الحالية وآخر أخطاء وقت التشغيل؛
- يعرض `vibejs logs` آخر مدخلات السجل، مصفّاة حسب المستوى أو المصدر أو النص أو الوقت؛
- يستدعي `vibejs request GET /api/users` مسارًا عبر الخادم العامل، أو داخل العملية نفسها عندما لا يوجد خادم عامل؛
- يعرض `vibejs di` وحدات الخادم ومزوّداته.

يسرد `vibejs routes` مسارات الـ API ومسارات الواجهة، ويسرد `vibejs components` مكوّنات `.vibe` مع props ونماذجها (models) ووسائط أنواعها. لا يحتاج أي منهما إلى خادم تطوير عامل.

## MCP {#mcp}

يقدّم `vibejs mcp` الأوامر إلى الوكيل كأدوات [MCP](https://modelcontextprotocol.io) عبر stdio. تجيب كل أداة كما يجيب أمرها مع `--json`:

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

مع `--read-only`، لا تقبل أداة `request` إلا `GET` و`HEAD` و`OPTIONS`.

## المرجع {#reference}

يسرد [مرجع سطر الأوامر](https://vibejs.org/v0/cli/) كل أمر مع خياراته وأمثلته؛ ويعيد `vibejs <command> --help --json` المرجع نفسه بصيغة JSON.
