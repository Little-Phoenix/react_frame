const selectedReddit = (state = 'frontend', action) => {

  switch (action.type) {
    case 'SELECT_REDDIT':
      return action.reddit
    default:
      return state
  }
}

const posts = (state = {
      isFetching: false,
      didInvalidate: false,
      items: []
    }, action) => {
      switch (action.type) {
        case 'INVALIDATE_REDDIT':
          return {
            ...state,
            didInvalidate: true
          }
        case 'REQUEST_POSTS':
          return{
            ...state,
            isFetching: true,
            didInvalidate: false
          }
        case 'RECEIVE_POSTS':
          return {
            ...state,
            isFetching: false,
            didInvalidate: false,
            items: action.posts,
            lastUpdated: action.receivedAt
          }
        default:
          return state
      }
    }
    //reducer2
    const postsByReddit = (state = { }, action) => {
      switch (action.type) {
        case 'INVALIDATE_REDDIT':
        case 'RECEIVE_POSTS':
        case 'REQUEST_POSTS':
          return {
            ...state,
            [action.reddit]: posts(state[action.reddit], action)
          }
        default:
          return state
      }
    }

function symbolObservablePonyfill(root){
  var result;
  var Symbol = root.Symbol;

  if(typeof Symbol === 'function'){
    if( Symbol.observable ){
      result = Symbol.observable;
    }else{
      result = Symbol('observable');
      Symbol.observable = result
    }
  }else{
    result = '@@observable'
  }

  return result
}

var root;

if(typeof self !== 'undefined'){
  root = self
}else if (typeof window !== 'undefined'){
  root = window
}else if (typeof global !== 'undefined'){
  root = global
}else if (typeof module !== 'undefined'){
  root = module
} else {
  root = Function('return this')()
}

var $$observable = symbolObservablePonyfill(root);

var ActionTypes = {
  INIT: '@@redux/INIT'
}

function createStore(reducer, preloadedState, enhancer){
  if(typeof preloadedState === 'function' && typeof enhancer === 'undefined'){
    enhancer = preloadedState
    preloadedState = undefined
  }

  if(typeof enhancer !== 'undefined'){
    if(typeof enhancer !== 'function'){
      throw new Error('Expected the enhancer to be a function.')
    }

    //存在中间件的时候
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

  function getState(){
    return currentState
  }

  function subscribe(listener){
    if( typeof listener !== 'function'){
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe(){
      if(!isSubscribed){
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  function dispatch(action){

    if( typeof action.type === 'undefined' ){
      throw new Error(
        `
          Actions may not have an undefined "type" property.
          Have you misspelled a constant
        `
      )
    }

    if(isDispatching){
      throw new Error('Reducers may not dispatch actions.')
    }

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

  function replaceReducer(nextReducer){
    if(typeof nextReducer !== 'function'){
      throw new Error('Expected the nextReducer to be a function. ')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  function observable(){
    var outerSubscribe = subscribe
    return{
      subscribe(observer){
        if(typeof observer !== 'object'){
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState(){
          if(observer.next){
            observer.next(getState())
          }
        }

        observeState()

        var unsubscribe = outerSubscribe(observeState)
        return {unsubscribe}
      },

      [$$observable](){
        return this
      }
    }
  }

  console.log(` >>>>>>>>>>>>>>>>>>>>>初始化state，执行dispatch, start<<<<<<<<<<<<<<<<<<`);
  dispatch({ type: ActionTypes.INIT })
  console.log(` >>>>>>>>>>>>>>>>>>>>>初始化state，执行dispatch, end<<<<<<<<<<<<<<<<<<`);

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}

var NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development'

    function warning(message){
      if(typeof console !== 'undefined' && typeof console.error === 'function'){
        console.error(message)
      }

      try{
        throw new Error(message)
      }catch(e){ }
    }

    function getUndefinedStateErrorMessage(key, action){
      var actionType = action && action.type
      var actionName = actionType && `"${actionType.toString()}"` || 'an action'

      return (
        `Given action ${actionName}, reducer "${key}" returned undefined.
        To ignore an action, you must explicitly return the previous state.`
        )
    }

    function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache){
      var reducerKeys = Object.keys(reducers)
      var argumentName = action && action.type === ActionTypes.INIT ?
        'preloadedState argument passed to createStore' :
        'previous state received to the reducer'

      if(reducerKeys.length === 0){
        return (
          `Store does not have a valid reducer. Make sure the argument passed
          to combineReducers is an object whose values are reducers.`
          )
      }

      var unexpectedKeys = Object.keys(inputState).filter(
        key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
        )

      unexpectedKeys.forEach(key => {
        unexpectedKeyCache[key] = true
        })

      if(unexpectedKeys.length > 0){
        return (
          `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'}
          "${unexpectedKeys.join('","')}" found in ${argumentName}.
          Expected to find one of the known reducer keys instead:
          "${reducerKeys.join('","')}". Unexpected keys will be ignored.`
          )
      }
    }

    //验证reducer是否健壮
    function assertReducerSanity(reducers){
      Object.keys(reducers).forEach(
        key => {
          //通过key，获取相关reducer
          var reducer = reducers[key]
          console.log(`   通过key，获取相关reducer，reducer key : "${key}"`);
          //执行reducer，返回默认状态，
          var initialState = reducer(undefined, {type: ActionTypes.INIT})

          console.log(`   返回reducer的初始化state："${initialState}"`);

          //判断返回值是否为undefined，如果是，则报错
          if (typeof initialState === 'undefined'){
            throw new Error(
              `Reducer "${key}" returned undefined during initialization.
              If the state passed to the reducer is undefined, you must
              explicitly return the initial state. The initial state may
              not be undefined`
              )
          }

          var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')

          if( typeof reducer(undefined, { type }) === 'undefined'){
            throw new Error(
              `Reducer "{$key}" returned undefined when probed with a random type.
              Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*"
              namespace. They are considered private. Instead, you must return the
              current state for any unknown actions, unless it is undefined,
              in which case you must return the initial state, regardless of the
              action type. The initial state may not be undefined.`
              )
          }
        })
    }

    function combineReducers(reducers){
      var reducerKeys = Object.keys(reducers)
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
      console.log(`reducer keys: ${finalReducerKeys.join(',')}`);

      if(NODE_ENV !== 'production'){
        var unexpectedKeyCache = {}
      }

      var sanityError
      try{
        //验证reducer是否符合规则，如果不符合则报错
        console.log('------------以下验证reducer是否合规-------');
        assertReducerSanity(finalReducers)
        console.log('------------以上验证reducer是否合规-------');
      } catch(e){
        sanityError = e
      }

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

          console.log(`       名称为'${key}'的reducer,传入参数'${previousStateForKey}'、'${JSON.stringify(action)}',返回state: '${nextStateForKey}'`);

          if(typeof nextStateForKey === 'undefined'){
            var errorMessage = getUndefinedStateErrorMessage(key, action)
            throw new Error(errorMessage)
          }

          nextState[key] = nextStateForKey
          console.log(`         执行reducer'${key}'后，state为：'${JSON.stringify(nextState)}'`);
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }

        return hasChanged ? nextState : state

      }
    }

//将多个reducer合并成一个combination方法，执行该方法，可以获取当前应用程序的state
console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>> combineReducers start <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
var reducers = combineReducers({selectedReddit, postsByReddit})
console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>> combineReducers end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);

console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>> createStore start <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
var store = createStore(reducers);
console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>> createStore end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
// export default store
