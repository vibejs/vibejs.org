# الخادم

خادم vibe.js هو شجرة من الوحدات (modules). تستورد الوحدة الجذرية وحدات الميزات؛ وتسرد كل وحدة مزوِّديها (providers) ومتحكماتها؛ ويخدم كل متحكم عقدًا واحدًا. بُني الخادم على Fetch API: التطبيق هو دالة `fetch(Request): Promise<Response>` تستمع أيضًا على Node.

## بنية التطبيق {#application-layout}

```
contracts/src/todos.contract.ts     the contract shared with the UI
server/src/app.module.ts            AppModule and appOptions
server/src/main.ts                  creates the app and listens
server/src/todos/todos.module.ts    a feature module
server/src/todos/todos.controller.ts
server/src/todos/todos.service.ts
```

يصدّر `server/src/app.module.ts` الوحدة الجذرية وخيارات التطبيق. يستورد خادم التطوير والأدوات والاختبارات هذا الملف، ولذلك لا آثار جانبية له:

```ts
@Module({ imports: [] })
export class AppModule {}

export const appOptions: AppOptions = { basePath: '/api' };
```

`server/src/main.ts` هو نقطة الدخول في الإنتاج. ينشئ التطبيق، ويغلقه عند `SIGTERM` و`SIGINT`، ويستمع:

```ts
const app = await VibeFactory.create(AppModule, appOptions);
app.enableShutdownHooks();
await app.listen(Number(process.env.PORT ?? 3000));
```

## إنشاء التطبيق {#creating-the-application}

تفحص `VibeFactory.create(root, options)` رسم الوحدات البياني، وتنشئ كل مزوِّد ومتحكم، وتشغّل خطافات `onModuleInit` و`onApplicationBootstrap`. وهي لا تستمع. خطأ في الرسم البياني، مثل مزوِّد مفقود ([VIBE9102](https://vibejs.org/v0/errors/VIBE9102)) أو مسار بلا معالج ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303))، يجعل `create` تُرفض قبل خدمة أي طلب.

الـ `App` المنشأ:

| العضو                           | ما يفعله                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch(req)`                    | يعالج طلبًا واحدًا. وهو مربوط (bound)، فيمكن تمريره كدالة عادية.                                                                                                      |
| `request(path, init?)`          | يرسل طلبًا داخل العملية نفسها؛ و`init.json` يضبط جسم JSON.                                                                                                           |
| `listen(port?, hostname?)`      | يقدّم التطبيق عبر HTTP على Node؛ والمنفذ الافتراضي 3000.                                                                                                              |
| `enableShutdownHooks(signals?)` | يستدعي `close()` عند كل إشارة، ثم يعيد إطلاقها.                                                                                                                      |
| `close(signal?)`                | يرفض الطلبات الجديدة بالحالة 503، وينتظر الطلبات الجارية حتى `shutdownTimeout`، ويوقف الخادم ويشغّل `onModuleDestroy` و`onApplicationShutdown`. واستدعاؤه مرتين آمن. |
| `get(token)`                    | يقرأ مزوِّدًا، للسكربتات والاختبارات.                                                                                                                                   |
| `inspect()`                     | يسرد المسارات والوحدات، للأدوات.                                                                                                                                     |

تعيد `inspect(root, options)` الوصف نفسه دون إنشاء التطبيق: لا يعمل أي مزوِّد أو متحكم أو معزّز (enhancer) أو خطاف، ولذلك تستطيع الأدوات والاختبارات قراءة الرسم البياني بأمان.

```ts
const { routes, modules } = inspect(AppModule, { basePath: '/api' });
console.log(routes.map((r) => `${r.method} ${r.path} -> ${r.handler}`));
console.log(modules.map((m) => m.path));
```

## النشر {#deploying}

يكتب `vibejs build` ناتجين قابلين للنشر:

- `ui/dist`: الواجهة الثابتة، تُقدَّم من أي مستضيف ملفات ثابتة أو CDN.
- `server/dist/main.js`: الخادم، يُشغَّل بـ `node server/dist/main.js`. يقرأ `PORT` ويجيب تحت `/api`.

وجِّه `/api` إلى الخادم وكل ما عداه إلى الملفات الثابتة. أثناء التطوير، يقدّم `vibejs dev` الاثنين على منفذ واحد.

## التالي {#next}

- [الوحدات والمزوِّدون](https://vibejs.org/v0/server/modules)
- [العقود](https://vibejs.org/v0/server/contracts)
- [المعالجات](https://vibejs.org/v0/server/handlers)
- [Middleware والحراس والمعترضات والمرشِّحات](https://vibejs.org/v0/server/pipeline)
- [الإعداد](https://vibejs.org/v0/server/configuration)
- [الاختبار](https://vibejs.org/v0/server/testing)
