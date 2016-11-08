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

    //如果applyMiddlewareByMoneypatching 方法中没有在第一个middleware 执行时立即替换掉 store.dispatch ,那么store.dispatch将会一直指向原始的dispatch方法。也就是说，第二个middleware 依旧会作用在原始的dispatch 方法。
    //但是，还有另一种方式来实现这种链式调用的效果。可以让middleware以方法参数的形式接收一个next()方法，而不是通过store的示例去获取

    function logger(store){
      return function wrapDispatchToAddLogging(next){
        return function dispatchAndLog(action){
          console.log('dispatching', action)
          let result = next(action)
          console.log('next state', store.getState())
          return result
        }
      }
    }

    //ES6写法：

    const logger = store => next => action => {
      console.log('dispatching', action)
      let result = next(action)
      console.log('next state', store.getState())
      return result
    }

    const crashReporter = store => next => action => {
      try {
        return next(action)
      }catch(err){
        console.log('Caught an exception!', err)
        Raven.captureException(err, {
          extra: {
            action,
            state: store.getState()
          }
          })
        throw err
      }
    }

  ```

## 单纯地使用middleware

  我们可以写一个applyMiddleware()方法替换掉原来的applyMiddlewareByMoneypatching()。在新的applyMiddleware()中，我们取得最终完整的被包装过的dispatch()函数，并返回一个store的副本：
  ```
    function applyMiddleware(store, middlewares){
      middlewares = middlewares.slice()
      middlewares.reverse()

      let dispatch = store.dispatch
      middlewares.forEach(middleware =>
        dispatch = middleware(store)(dispatch))

      return Object.assgin({}, store, { dispatch })
    }

  ```
  这与Redux中 applyMiddleware() 的实现已经很接近了， 但是有三个重要的不同之处：
  1. 它只暴露一个store API 的子集给middleware: dispatch(action) 和 getState()
  2. 它用了一个非常巧妙的方式来保证你的middleware调用的是 store.dispatch(action) 而不是 next(action) ，从而使这个 action 会在包括当前middleware在内的整个middleware链中被正确的传递。这对异步的middleware非常有用。
  3. 为了保证你只能应用middleware一次，它作用在 createStore() 上而不是 store 本身。因此它的签名不是(store, middlewares) => store, 而是 (...middlewares) => (createStore) => createStore.

## 最终的方法：
  刚刚所写的middleware:
  ```
    const logger = store => next => action => {
      console.log('dispatching', action)
      let result = next(action)
      console.log('next state', store.getState())

      return result
    }

    const crashReporter = store => next => action => {
      try{
        return next(action)
      }catch (err) {
        console.error('Caught an exception!', err)
        Raven.captureException(err, {
          extra: {
            action,
            state: store.getState()
          }
        })
        throw err
      }
    }

    //然后是将它们引用到Redux store中：

    import { createStore, combineReducers, applyMiddleware } from 'redux'

    //applyMiddleware 接收 createStore()
    //并返回一个包含兼容 API 的函数
    let createStoreWithMiddleware = applyMiddleware(logger, crashReporter)(createStore)

    //像使用 createStore() 一样使用它
    let todoApp = combineReducers(reducers)
    let store = createStoreWithMiddleware(todoApp)

    //现在任何被发送到store的action都会经过logger 和crashReporter：
    //将经过 logger 和 crashReporter 两个 middleware!
    store.dispatch(addTodo('Use Redux'))
  ```

## 7个示例
  ```
    /**
     * 记录所有被发起的 action 以及产生的新的 state
     */
     const logger = store => next => action => {
       console.group(action.type)
       console.info('dispatching', action)
       let result = next(action)
       console.log('next state', store.getState())
       console.groupEnd(action.type)
       return result
     }

    /**
     * 在 state 更新完成和 listener 被通知之后发送崩溃报告
     */
     const crashReporter = store => next => action => {
        try{
          return next(action)
        } catch (err){
          console.err('Caught an exception!', err)
          Raven.captureException(err, {
            extra: {
              action,
              state: store.getState()
            }
          })
          throw err
        }
      }

    /**
     * 用{ meta: { delay: N } } 来让 action 延迟 N 毫秒
     * 在这个案例中，让 'dispatch' 返回一个取消 timeout 的函数
     */
   const timeoutScheduler = store => next => action => {
     if(!action.meta || !action.meta.delay){
       return next(action)
     }

     let timeoutId = setTimeout(
       () => next(action),
       action.meta.dalay
     )

     return function cancel() {
       clearTimeout(timeoutId)
     }
   }

   /**
    * 通过{meta: {raf: true}} 让 action 在一个 rAF 循环帧中被发起。
    * 在这个案例中，让`dispatch` 返回一个从队列中移除该 action 的函数
    */
    const rafScheduler = store => next => {
      let queuedActions = []
      let frame = null

      function loop(){
        frame = null
        try{
          if (queuedActions.length){
            next(queuedActions.shift())
          }
        } finally {
          maybeRaf()
        }
      }

      function maybeRaf() {
        if (queuedActions.length && !frame){
          frame = requestAnimationFrame(loop)
        }
      }

      return action => {
        if( !action.meta || !action.meta.raf ){
          return next(action)
        }

        queuedActions.push(action)
        maybeRaf()

        return function cancel(){
          queuedActions = queuedActions.filter(a => a !== action)
        }
      }
    }

    /**
     * 使你除了 action 之外还可以发起 promise。
     * 如果这个 promise 被 resolved， 他的结果将被作为 action 发起
     * 这个promise 会被 `dispatch` 返回，因此调用者可以处理 rejection。
     */
    const vanillaPromise = store => next => action => {
      if(typeof action.then !== 'function'){
        return next(action)
      }

      return Promise.resolved(action).then(store.dispatch)
    }

    /**
     * 让你可以发起带有一个{ promise } 属性的特殊 action.
     * 这个 middleware 会在开始时发起一个 action， 并在这个 `promise` resolved 时发起另一个成功（或失败）的action
     * 为了方便起见， `dispatch` 会返回这个 promise 让调用者可以等待。
     */
    const readyStatePromise = store => next => action => {
      if(!action.promise){
        return next(action)
      }

      function makeAction(ready, data){
        let newAction = Object.assgin({}, action, { ready }, data)
        delete newAction.promise
        return newAction
      }

      next(makeAction(false))
      return action.promise.then(
        result => next(makeAction(true, { result })),
        error => next(makeAction(true, { error }))
      )
    }

    /**
     * 让你可以发起一个函数来替代 action
     * 这个函数接收`dispatch` 和 `getState` 作为参数
     * 对于（根据`getState()`的情况）提前退出，或者异步控制流（`dispatch()` 一些其他东西）来说，这非常有用。
     * `dispatch` 会返回被发起函数的返回值
     */
    const thunk = store => next => action =>
      typeof action === 'function' ?
        action(store.dispatch, store.getState) : next(action)

    // 你可以使用以上全部的 middleware！（当然，这不意味着你必须全部都使用。）
    let createStoreWithMiddleware = applyMiddleware(
      rafScheduler,
      timeoutScheduler,
      thunk,
      vanillaPromise,
      readyStatePromise,
      logger,
      crashReporter
    )(createStore)

    let todoApp = combineReducers(reducers)
    let store = createStoreWithMiddleware(todoApp)
  ```
