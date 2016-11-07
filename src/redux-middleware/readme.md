# middleware
  redux middleware被用于解决不同的问题。它提供的是位于action被发起之后，到达reducer之前的扩展点。
  你可以利用Redux mddleware来进行日志记录、创建崩溃报告、调用异步接口或者路由等等。

# 记录日志：
## 手动记录：
  ```
    //正在创建一个Todo时调用方式：
    store.dispatch(addTodo('Use Redux'));

    //为了记录这个action以及产生的新的state，你可以通过这种方式记录日志：
    let action = addTodo('Use Redux');

    console.log('dispatching', action)
    store.dispatch(action);
    console.log('next state', store.getState())
  ```
## 封装Dispatch
  ```
    function dispatchAndLog(store, action){
      console.log('dispatching', action)
      store.dispatch(action)
      console.log('next state', store.getState())
    }

    //然后用它替换store.dispatch():

    dispatchAndLog(store, addTodo('Use Redux'))
    //你可以选择到此位置，但每次都要导入一个外部方法总归还是不太方便。
  ```

## Monkeypatching dispatch
  如果我们直接替换store实例中的 dispatch 函数会怎么样呢？ Redux store 只是一个包含一些方法的普通对象，同时我们使用的是JavaScript，因此我们可以这样实现 dispatch 的monkeypatch:
  ```
    let next = store.dispatch
    store.dispatch = function dispatchAndLog(action){
      console.log('dispatching', action)
      let result = next(action)
      console.log('next store', store.getState())
      return result
    }

  ```
#### 崩溃报告
  当发起一个action的结果是一个异常时， 我们将包含调用堆栈， 引起错误的 action 以及当前的 state 等错误信息通通发到类似与 Sentry 这样的报告服务中，这样我们可以更容易地在开发环境中重现这个错误。
  然而，将日志记录和崩溃报告分离是很重要的。理想情况下，我们希望他们是两个不同的模块，也可能在不同的包中。否则我们无法构建一个由这些工具组成的生态系统。
  ```
    function patchStoreToAddLogging(store){
      let next = store.dispatch
      store.dispatch = function dispatchAndLog(action){
        console.log('dispatching', action);
        let result = next(action)
        console.log('next state', store.getState())
        return result
      }
    }

    function patchStoreToAddCrashReporting(store){
      let next = store.dispatch
      store.dispatch = function dispatchAndReportErrors(action){
        try{
          return next(action)
        } catch (err){
          console.error('捕获一个异常！', err)
          Raven.captureException(err, {
            extra: {
              action,
              state: store.getState()
            }
          })
          throw err
        }
      }
    }

    //如果这些功能以不同的模块发布， 我们可以在 store 中像这样使用它们：
    patchStoreToAddLogging(store)
    patchStoreToAddCrashReporting(store)
  ```
## 隐藏 Monkeypatching
  Monkeypatching 本质上是一种hack。“将任意的方法替换成你想要的”，此时的API会是什么样的呢？ 现在，让我们来看看这种替换的本质。在之前，我们用自己的函数替换掉了store.dispatch。如果我们不这样做，而是在函数中返回新的 dispatch 呢？

  ```
    function logger(store){
      let next = store.dispatch

      //我们之前的做法：
      // store.dispatch = function dispatchAndLog(action){}
      return function dispatchAndLog(action){
        console.log('dispatching', action)
        let result = next(action)
        console.log('next state', store.getState())
        return result
      }
    }

    //我们可以在Redux内部提供一个可以将实际的 monkeypatching 应用到 store.dispatch 中的辅助方法：
    function applyMiddlewareByMoneypatching(store, middlewares){
      middlewares = middlewares.slice()
      middlewares.reverse()

      //在每一个middleware中变换 dispatch 方法。
      middlewares.forEach(middleware =>
        store.dispatch = middleware(store)
      )
    }

    然后像这样应用多个middleware:
    applyMiddlewareByMoneypatching(store, [logger, crashReporter])

  ```

## 移除 Monkeypatching
  每一个 middleware 都可以操作（或者直接调用）前一个 middleware 包装过的 store.dispatch:
  ```
    function logger(store){
      //这里的 next 必须指向前一个 middleware 返回的函数：
      let next = store.dispatch

      return function dispatchingAndLog(action){
        console.log('dispatching', action)
        let result = next(action)
        console.log('next state', state.getState())
        return result
      }
    }

  ```
