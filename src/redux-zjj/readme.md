n# 中间件使用

  ```
    import { applyMiddleware, createStore }  from 'redux';
    import createLogger from 'redux-logger';
    const logger = createLogger();

    const store = createStore(
      reducers,
      applyMiddleware(logger)
    );
  ```
  上面代码中，redux-logger 提供一个生成器 createLogger , 可以生成日志中间件 logger 。 然后，将它放在 applyMiddleware 方法之中，传入 createStore 方法，就完成了store.dispatch()的功能增强

### 中间件的用法
  redux-logger 提供一个生成器createLogger, 可以生成日志中间件logger。 然后，将它放在applyMiddleware 方法之中， 传入 createStore 方法，就完成了 store.dispatch() 的功能增强

  这里有两点需要注意：

    1. createStore方法可以接受整个应用的初始状态作为参数，那样的话， applyMiddleware 就是第三个参数了。
    2. 中间件的次序有讲究，使用前要查一下文档

### applyMiddlewares()
  它是Redux的原生方法， 作用是将所有中间件组成一个数组， 依次执行。下面是它的源码：

  ```
    export default function applyMiddleware(...middlewares){
      return (createStore) => (reducer, preloadedState, enhancer) => {
        var store = createStore(reducer, preloadedState, enhancer);
        var dispatch = store.dispatch;
        var chain = [];

        var middlewareAPI = {
          getState: store.getState,
          dispatch: (action) => dispatch(action)
        };

        chain = middlewares.map(middleware => middleware(middleWareAPI));
        dispatch = compose(...chain)(store.dispatch);

        return {...store, dispatch}
      }
    }
  ```

  上面代码中，所有中间件被放进了一个数组 chain ， 然后嵌套执行， 最后执行 store.dispatch . 可以看到，中间件内部（middlewareAPI) 可以拿到getState 和dispatch 这两个方法

### 异步操作的基本思路
  同步操作只要发出一种Action即可， 异步操作的差别是它要发出三种Action。

    操作发起时的 Action
    操作成功时的 Action
    操作失败时的 Action

  以向服务器取出数据为例， 三种 Action 可以有两种不同的写法。

  ```
    // 写法一： 名称相同，参数不同
    { type: 'FETCH_POSTS' }
    { type: 'FETCH_POSTS', status: 'error', error: 'Oops'}
    { type: 'FETCH_POSTS', status: 'success', response: {...} }

    // 写法二： 名称不同
    { type: 'FETCH_POSTS_REQUEST' }
    { type: 'FETCH_POSTS_FAILURE', error: 'Oops'}
    { type: 'FETCH_POSTS_SUCCESS', response: { ... }}
  ```
  除了 Action 种类不同，异步操作的 State 也要进行改造， 反映不同的操作状态。

  ```
    let state = {
      isFetching: true,
      didInvalidate: true,
      lastUpdated: 'xxxxxxx'
    }
  ```
  上面代码中，State 的属性 isFetching 表示是否在抓取数据。didInvalidate 表示数据是否过时， lastUpdated 表示上一次更新时间。

  现在， 整个异步操作的思路就很清楚了。

    操作开始时，送出一个 Action， 触发 State 更新为 “正在操作” 状态， View重新渲染
    操作结束后，再送出一个 Action，触发 State 更新为 “操作结束” 状态， View再一次重新渲染

### redux-thunk 中间件

  异步操作至少要送出两个Action： 用户触发第一个Action，这个跟同步操作一样， 没有问题： 如何才能在操作结束时， 系统自动送出第二个 Action 呢？

  奥妙就在 Action Creator 之中。

  ```
    class AsyncApp extends Component{
      componentDidMount() {
        const { dispatch, selectedPost } = this.props
        dispatch( fetchPosts(selectedPost) )
      }
    }
  ```

  上面代码是一个异步组件的例子。加载成功后（componentDidMount 方法），它送出了（dispatch方法）一个Action，服务器要求数据fetchPosts(selectedSubreddit)。这里的fetchPosts 就是 Action Creator。
