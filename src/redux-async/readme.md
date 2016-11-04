# state初始化

  1. reducers

      每个传入combineReducers的 reducer都需要满足以下规则：
      1. 所有未匹配到的action，必须把它接收到的第一个参数也就是那个state原封不动返回。
      2. 永远不能返回undefined。当过早return时非常容易犯这个错误，为了避免错误扩散，遇到这种情况时 combineReducers会抛出异常。
      3. 如果传入的state是undefined， 一定要返回对应reducer的初始state。根据上一条规则，初始state禁止使用undefined。使用ES6的默认参数值语法来设置初始state很容易，但你也可以手动检查第一个参数是否为undefined

    ```
      //reducer1
      const selectedReddit = (state = 'frontend', action) => {
        switch(action.type){
          case 'SELECT_REDDIT':
            return action.reddit
          default
            return state
        }
      }

      //reducer2
      const postsByReddit = (state = { }, action) => {

        switch (action.type) {
          case INVALIDATE_REDDIT:
          case RECEIVE_POSTS:
          case REQUEST_POSTS:
            return {
              ...state,
              //doSomething，具体请参照[test.js](./test.js)
            }
          default:
            return state
        }
      }
    ```

    通过combineReducers可以将多个reducer合并到一起

  2. combineReducers

      ```
        function combineReducers(reducers){
          var reducerKeys = Object.keys{reducers}
          var finalReducers = {}
          //将 key对应的对象不是function的reducer过滤掉
          for(var i=0; i < reducerKeys.length; i++){
            var key = reducerKeys[i]

            if(NODE_ENV !== 'production'){
              if(typeof reducers[key] === 'undefined'){
                warning(
                  `No reducer provided for key "${key}"`
                  )
              }
            }

            if(typeof reducers[key] === 'function'){
              finalReducers[key] = reducers[key]
            }
          }

          //typeof reducer === 'function'
          var finalReducerKeys = Object.keys(finalReducers)

          //combineReducers({})执行后，返回combination方法，执行该方法，返回一个合成state对象，state对象的结构由传入的多个reducer的key决定
          // state对象的结构： {reducerName1: state1, reducerName2: state2}
          return function combination(state = {}, action){
            if (sanityError){
              throw sanityError
            }

            if(NODE_ENV !== 'production'){
              var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
              if (warningMessage){
                warning(warningMessage)
              }
            }

            var hasChanged = false
            var nextState = {}
            for(var i = 0; i < finalReducerKeys.length; i++){
              var key = finalReducerKeys[i]
              var reducer = finalReducers[key]
              var previousStateForKey = state[key]
              var nextStateForKey = reducer(previousStateForKey, action)

              if(typeof nextStateForKey === 'undefined'){
                var errorMessage = getUndefinedStateErrorMessage(key, action)
                throw new Error(errorMessage)
              }

              nextState[key] = nextStateForKey
              hasChanged = hasChanged || nextStateForKey !== previousStateForKey
            }

            return hasChanged ? nextState : state

          }
        }
      ```

  3. createStore关键代码

    通过dispatch(action)执行reducer，通过switch判断该执行哪种操作。
    通过getState()获取应用当前state

    ```
      function createStore(reducer, preloadedState, enhancer){
        if(typeof preloadedState === 'function' && typeof enhancer === 'undefined'){
          enhancer = preloadedState
          preloadedState = undefined
        }

        var currentReducer = reducer
        var currentState = preloadedState
        var currentListeners = []
        var nextListeners = currentListeners
        var isDispatching = false

        function getState(){
          return currentState
        }

        function dispatch(action){
          try{
            isDispatching = true
            console.log(`   >>>>>>>>>>>>执行combination start<<<<<<<<<<`);
            currentState = currentReducer(currentState, action)
            console.log(`   >>>>>>>>>>>>执行combination end, 当前state: '${JSON.stringify(currentState)}'  <<<<<<<<<<<<`);
          }finally{
            isDispatching = false
          }

          var listeners = currentListeners = nextListeners
          for(var i=0; i < listeners.length; i++){
            var listener = listeners[i]
            listener()
          }

          return action
        }

        console.log(` >>>>>>>>>>>>>>>>>>>>>初始化state，执行dispatch, start<<<<<<<<<<<<<<<<<<`);
        dispatch({ type: ActionTypes.INIT })
        console.log(` >>>>>>>>>>>>>>>>>>>>>初始化state，执行dispatch, end<<<<<<<<<<<<<<<<<<`);

        return {
          dispatch,
          getState
        }
      }
    ```
