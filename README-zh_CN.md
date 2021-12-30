# oinit

[![npm license](https://img.shields.io/npm/l/oinit.svg?sanitize=true)](https://github.com/darkXmo/oinit/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/oinit.svg?sanitize=true)](https://www.npmjs.com/package/oinit)

Promise Function Init Once, Use Everywhere.

只会被初始化一次的 `Promise` 函数。

> 第一次调用对象的时候会执行 `Promise` 函数初始化，重复调用，初始化将不会再次执行。

> 同一个 `Promise` 不会在同一时间内被执行两次。

> `oinit` 是 `once init` 的缩写。

[完整版 Github 仓库(包括`factory`和`onLoading`)](https://github.com/darkXmo/once-init)

## 承诺

1. **`OnceInit` 封装的 `Promise Function` ，永远不会在同一时间被执行两次。**
2. 如果上一个 `Promise Function` 没有执行完成就调用了下一个 `Promise Function` ，那么下一个 `Promise Function` 将共享上一个`Promise Function` 的 `Promise`。

## 示例

假设存在一个 `axios` `Promise` 请求，返回值类型为 `number` ，值为 `777`。

```typescript
const requestNumber = async () => {
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
```

你可以使用 `oi` 来封装这个 `Promise` 函数

```typescript
const oiInstance = oi(requestNumber);
```

现在，你可以在任何地方调用这个实例。

### init

假设有两个方法 `functionA` 和 `functionA`，都需要发送这个请求。

```typescript
async function functionA() {
  ...
  const res = await oiInstance.init();
  ...
}

async function functionB() {
  ...
  const res = await oiInstance.init();
  ...
}
```

而你需要在某个文件中，需要同时使用这两个方法。

```typescript
/** asynchronous executing */
async function functionC() {
  await functionA();
  await functionB();
}
/** Synchronous executing */
function functionD() {
  functionA();
  functionB();
}
```

对于 `functionC`， 在**第一次执行 `init` 之后**，`oiInstance` 将会保存 `Promise` 的执行结果，此后再执行 `init` ，将**不会再发出 `Promise` 请求**。

对于 `functionD`， `api` 请求只会发送一次，`functionA` 和 `functionB` 中的 `res` 都将等待**同一个请求**的返回值，不会发送重复的请求。

这个示例能帮助你更好地理解

```typescript
const requestNumber = async () => {
  console.log("Load");
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
const oiInstance = oi(requestNumber);
/** only One Promise will be executed */
/** only One 'Load' will be output on console */
oiInstance.init().then((res) => {
  console.log(res); // [Promise Return Value] 777
});
oiInstance.init().then((res) => {
  console.log(res); // [Promise Return Value] 777
});
```

```typescript
const requestNumber = async () => {
  console.log("Load");
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
const oiInstance = oi(requestNumber);
/** only One Promise will be executed */
/** only One 'Load' will be output on console */
await oiInstance.init();
await oiInstance.init(); // since the value has been initialized, it will return value immediately
```

### target

`target` 是同步获取返回值的 `api` 。

```typescript
function functionE() {
  ...
  const res = oiInstance.target;
  ...
}
```

如果在这之前已经完成初始化的话，`target` 的值将是 `Promise` 的返回值，否则，`target` 的值将会是 `undefined` 。例如，

```typescript
const res = oiInstance.target; // undefined
```

```typescript
await oiInstance.init();

const res = oiInstance.target; // [Return Value] 777
```

请注意，虽然是同步获取，如果没有事先完成初始化的话，获取 `target` 属性也会开始初始化。

在下面这个例子中，我们假设 `api` 的请求时长是 `10s` 。在下面这个例子里，请求在

```typescript
const res = oiInstance.target; // undefined
/** Promise has been executed. */
setTimeout(async () => {
  const resAfter = oiInstance.target; // [Return Value] 777
  const intAffter = await oiInstance.init(); // [Return Value] 777 , Promise will not be executed again.
  /** Since The Promise has been executed before, it will not be executed again. */
}, 10001);
```

和同时先后同步执行两次 `init` 一样，假如在获取 `init` 之前访问了 `target` 属性，而 访问 `target` 导致的 `Promise` 请求没有结束的话，`init` 将直接等待上一个 `Promise` 结束并获取同一个值。

下面这个例子将会帮助你理解。

```typescript
const res = oiInstance.target; // undefined
setTimeout(async () => {
  const resAfter = oiInstance.target; // undefined
  const intAffter = await oiInstance.init(); // [Return Value] 777
  /** Since The Promise has been executing it will not be executing again.  */
  /** After About 8000ms, The Value will be return by the first promise done */
}, 2000);
```

### defaultValue

这里的 `init` 将会等待上一个 `Promise` 函数执行的返回值，由于 `init` 是在 `200ms` 之后才执行的，所以它只需要再等待大约 `800ms` 就能获得这个返回值了。

使用 `target` 属性通常需要搭配默认值，而 `oi` 的第二个参数可以为你的 `Promise` 定义默认值。

```typescript
const defaultValue = -1;
const oiInstance = oi(requestNumber, defaultValue);

const ans = oiInstance.target; // -1
```

### refresh

你如果想要更新实例的值，则需要调用 `refresh` 。

假设第一次加载的值是 `777` ，而刷新之后的值是 `888` 。

```typescript
const ans = await oiInstance.init(); // [Retrun Value] 777
const ansAfterRefresh = await oiInstance.refresh(); // [Retrun Value] 888
```

刷新之后，调用 `init` 和 `target` 获取的值都将会更新。

```typescript
oiInstance.target; // undefined
await oiInstance.init(); // [Promise Retrun Value] 777
oiInstance.target; // 777
await oiInstance.refresh(); // [Promise Retrun Value] 888
oiInstance.target; // 888 /** Promise will not be exectued again */
await oiInstance.init(); // 888 /** Promise will not be exectued again */
```

你可以直接使用 `refresh` 来执行初始化，在初始化上，它和 `init` 的效果一致。

```typescript
oiInstance.target; // undefined
await oiInstance.refresh(); // [Promise Retrun Value] 777
oiInstance.target; // 777
await oiInstance.refresh(); // [Promise Retrun Value] 888
oiInstance.target; // 888
```

如果同步先后调用了两次 `refresh` ，两次 `refresh` 将等待**同一个请求**的返回值，不会发送重复的请求。

```typescript
async function functionA() {
  console.log("A", await oiInstance.refresh());
}
async function functionB() {
  console.log("B", await oiInstance.refresh());
}
functionA(); // 'A', [Promise Retrun Value] 777
functionB(); // 'B', [Promise Retrun Value] 777
/** only one promise is executed */
/** functionA and functionB share A same promise and promise return value */
```

```typescript
oiInstance.refresh((res) => {
  console.log(res); // [Promise Retrun Value] 777
});
oiInstance.refresh((res) => {
  console.log(res); // [Promise Retrun Value] 777
});
```

我们仍然假设 `api` 请求的时长为 `10s === 10000ms` 。

```typescript
oiInstance.refresh();
setTimeout(async () => {
  await oiInstance.refresh();
}, 2000);
/** After 10000ms, two refresh will be exected at the same time */
```

如果异步先后调用了两次 `refresh` ，那么发送两次请求，和不封装的效果一致。

```typescript
async function functionA() {
  console.log("A", await oiInstance.refresh());
}
async function functionB() {
  console.log("B", await oiInstance.refresh());
}
await functionA(); // 'A', [Promise Retrun Value] 777
await functionB(); // 'B', [Promise Retrun Value] 888
/** Two different promises were executed */
```

**如果你觉得逻辑太过复杂，那请至少要记住一点，`OnceInit` 封装的 `Promise Function` ，永远不会在同一时间被执行两次**。
