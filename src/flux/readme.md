## Flux学习
  react并不是一个MVC框架，而只能作为MVC中的V, flux可以看做一个完整的MVC框架

## Flux的最大特点，就是数据的“单向流动”：
  ![img](http://www.ruanyifeng.com/blogimg/asset/2016/bg2016011503.png)

    1. 用户访问view
    2. view发出用户的Action
    3. Dispatcher收到Action, 要求Store 进行相应的更新
    4. Store更新后，发出一个“change”事件
    5. View收到“change”事件后，更新页面
