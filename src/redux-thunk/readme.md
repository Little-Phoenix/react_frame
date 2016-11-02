# redux-thunk

## 什么是thunk
  ```
    thunk是一个方法： 该方法是一个可以延迟执行的表达式

    //此时直接执行 1 + 2
    // x === 3
    let x = 1 + 2;

    // 1 + 2 的计算被推迟
    // foo 可以稍后被调用，同时获取计算结果
    // foo 就是一个thunk
    let foo = () => 1 + 2;
  ```

## redux-thunk源码
  ```
    function createThunkMiddleware(extraArgument){
      return ({ dispatch, getState }) => next => action => {
        if(typeof action === 'function'){
          return action(dispatch, getState, extraArgument)
        }

        return next(action)
      }
    }

    const thunk = createThunkMiddleware();
    thunk.withExtraArgument = createThunkMiddleware;

    export default thunk;
  ```


## 要使用redux-thunk，需要有applyMiddleware() 的环境

## compose源码-redux
  ```
    // 从优稻作组织所有单变量方法，
    // 最右边的方法拿到多个变量作为复杂方法的参数
    function compose(...funcs){
      if(funcs.length === 0){
        return arg => arg
      }

      if(funcs.length === 1){
        return funcs[0]
      }

      const last = funcs[funcs.length - 1]
      const rest = funcs.slice(0, -1)
      return (...args) => rest.reduceRight((compose, f) => f(composed), last(...args))
    }
  ```

## applyMiddleware源码 -redux

  ```
    /**
      * 创建一个中间件的存储，用来分派方法，
      * 以便利的适用于各类任务，
      * 如异步处理、或者记录日志，
      *
      * 可以参考redux-thunk作为一个redux中间件的示例
      *
      * 异步处理中间件必须放在结构链的第一位
      * 注意：每一个中间件都将被分配dispatch、getState作为参数名的参数
      */
    function applyMiddleware(...middlewares){
      return (createStore) => (reducer, preloadedState, enhancer) => {
        var store = createStore(reducer, preloadedState, enhancer)
        var dispatch = store.dispatch
        var chain = []

        var middlewareAPI = {
          getState: state.getState,
          dispatch: (action) => dispatch(action)
        }

        chain = middlewares.map(middleware => middleware(middlewareAPI))
        dispatch = compose(...chain)(store.dispatch)

        return {
          ...store,
          dispatch
        }
      }
    }
  ```

## createStore源码 -redux
  ```
    // 这些是redux保留的私有action types
    // 对任何一种未知的action，都必须返回当前state，
    // 如果当前state未定义，则必须return初始化state
    // 在代码中不需要直接引用这些action types
    export var ActionTypes = {
      INIT: '@@redux/INIT'
    }

    // 创建redux存储，用来保存状态树
    // 改变存储中的数据唯一方式是采用dispatch()
    // 在一个App中只有一个存储
    // 为了指定actions的不同响应，可以结合多种reducers（通过使用combineReducers方法）
    // @param {Function} reducer 一个返回下一个state树的方法，用来处理action，返回当前状态树
    // @param {any} [preloadedState] 初始化state，你可以在通用apps中随意指定合并state，或者修复一个先前的用户会话序列
    //              如果用combineReducers来产生reducer方法，就必须和combineReducers一致
    // @param {Function} [enhancer] 存储附属，可选指定第三方功能，如中间件、timetravel、persistence等。需要采用applyMiddleware()进行搭载
    // @returns {Store} 返回redux 存储的状态树、dispatch actions 和 对变化的监听

    export default function createStore(reducer, preloadedState, enhancer){
      if(typeof preloadedState === 'function' && typeof enhancer === 'undefined'){
        enhancer = preloadedState
        preloadedState = undefined
      }

      if(typeof enhancer !== 'undefined'){
        if(typeof enhancer !== 'function'){
          throw new Error('Expected the enhancer to be a function.')
        }

        return enhancer(createStore)(reducer, preloadedState)
      }

      if(typeof reducer !== 'function'){
        throw new Error('Expected the reducer to be a function.')
      }

      var currentReducer = reducer
      var currentState = preloadedState
      var currentListeners = []
      var nextListeners = currentListeners
      var isDispatching = false

      function ensureCanMutateNextListeners(){
        if(nextListeners === currentListeners){
          nextListeners = currentListeners.slice()
        }
      }
    }
  ```
