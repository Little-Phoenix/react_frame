# 中间件使用

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
