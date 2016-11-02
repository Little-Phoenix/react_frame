# async理解

  1. 通过redux的applyMiddleware，增加redux-thunk、redux-logger中间件，用以增加异步调用、日志功能
  2. Provider可以为App的子组件提供props
  3. store = createLogger(reducer, applyMiddleware(...middleware))
  4. reducer为action的最终处理
