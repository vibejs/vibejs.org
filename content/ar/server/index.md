# الخادم

خادم vibe.js شجرة من الوحدات (modules). تستورد الوحدة الجذر وحدات الميزات، وتذكر كل وحدة providers والمتحكّمات الخاصة بها، ويقدّم كل متحكّم عقدًا واحدًا. الخادم مبني على Fetch API: التطبيق دالة `fetch(Request): Promise<Response>`، ويستطيع أيضًا أن يستمع على Node.

## بنية التطبيق {#application-layout}

```
contracts/src/todos.contract.ts     the contract shared with the UI
server/src/app.module.ts            AppModule and appOptions
server/src/main.ts                  creates the app and listens
server/src/todos/todos.module.ts    a feature module
server/src/todos/todos.controller.ts
server/src/todos/todos.service.ts
```

يصدّر `server/src/app.module.ts` الوحدة الجذر وخيارات التطبيق. يستورد هذا الملفَّ خادمُ التطوير والأدوات والاختبارات، لذلك لا آثار جانبية فيه:

```ts
@Module({ imports: [] })
export class AppModule {}

export const appOptions: AppOptions = { basePath: '/api' };
```

`server/src/main.ts` هو نقطة الدخول في الإنتاج. ينشئ التطبيق، ويغلقه عند `SIGTERM` و`SIGINT`، ثم يبدأ الاستماع:

```ts
const app = await VibeFactory.create(AppModule, appOptions);
app.enableShutdownHooks();
await app.listen(Number(process.env.PORT ?? 3000));
```

## إنشاء التطبيق {#creating-the-application}

تمسح `VibeFactory.create(root, options)` مخطط الوحدات، وتنشئ كل provider وكل متحكّم، وتشغّل الخطّافين `onModuleInit` و`onApplicationBootstrap`. لكنها لا تبدأ الاستماع. وأي خطأ في المخطط، مثل provider مفقود ([VIBE9102](https://vibejs.org/v0/errors/VIBE9102)) أو مسار بلا معالج ([VIBE9303](https://vibejs.org/v0/errors/VIBE9303))، يجعل `create` ترفض قبل تقديم أي طلب.

الـ `App` الناتج:

| العضو                           | ما يفعله                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch(req)`                    | يعالج طلبًا واحدًا. وهو مربوط، فتستطيع تمريره دالةً عادية.                                                                                                        |
| `request(path, init?)`          | يرسل طلبًا داخل العملية نفسها، و`init.json` يضبط جسمًا بصيغة JSON.                                                                                               |
| `listen(port?, hostname?)`      | يقدّم التطبيق عبر HTTP على Node، والمنفذ الافتراضي 3000.                                                                                                         |
| `enableShutdownHooks(signals?)` | يستدعي `close()` عند كل إشارة، ثم يعيد إطلاقها.                                                                                                                 |
| `close(signal?)`                | يرفض الطلبات الجديدة بـ 503، وينتظر الطلبات الجارية حتى `shutdownTimeout`، ويوقف الخادم، ويشغّل `onModuleDestroy` و`onApplicationShutdown`. استدعاؤه مرتين آمن. |
| `get(token)`                    | يقرأ provider، للسكربتات والاختبارات.                                                                                                                           |
| `inspect()`                     | يعرض المسارات والوحدات، للأدوات.                                                                                                                                |

تعيد `inspect(root, options)` الوصف نفسه دون إنشاء التطبيق: لا يعمل أي provider ولا متحكّم ولا enhancer ولا خطّاف، فتستطيع الأدوات والاختبارات قراءة المخطط بأمان.

```ts
const { routes, modules } = inspect(AppModule, { basePath: '/api' });
console.log(routes.map((r) => `${r.method} ${r.path} -> ${r.handler}`));
console.log(modules.map((m) => m.path));
```

## النشر {#deploying}

يكتب `vibejs build` مخرَجين قابلين للنشر:

- `ui/dist`: الواجهة الثابتة، ويقدّمها أي مستضيف للملفات الثابتة أو أي CDN.
- `server/dist/main.js`: الخادم، وتشغّله بـ `node server/dist/main.js`. يقرأ `PORT` ويجيب تحت `/api`.

وجّه `/api` إلى الخادم، وكل ما عداه إلى الملفات الثابتة. وأثناء التطوير، يقدّم `vibejs dev` الاثنين على منفذ واحد.

## التالي {#next}

- [الوحدات وproviders](https://vibejs.org/v0/server/modules)
- [العقود](https://vibejs.org/v0/server/contracts)
- [المعالجات](https://vibejs.org/v0/server/handlers)
- [middleware وguards وinterceptors والمرشِّحات](https://vibejs.org/v0/server/pipeline)
- [الإعدادات](https://vibejs.org/v0/server/configuration)
- [الاختبار](https://vibejs.org/v0/server/testing)
