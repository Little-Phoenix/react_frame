# todo-list

  根据之前学习redux看到的todomvc，自己尝试写一下待办功能，
  希望能够基于redux独立完成所有的功能

# 明确要完成的功能:

  ```
    增：addTodo
    删：deleteTodo, clearCompleted
    改：editTodo
    标记为完成：completedAll, completedTodo

    过滤：showAll, showCompleted, showActive
  ```

# redux几个重要的点：

  ```
    connect()()将数据、UI关联起来
    combineReducers() 将所有的reducer合并
    reducers: 实际所有的action处理
    actions： 存储所有的动作包括type等   
    components: 所有的UI
  ```               


# redux 是 facebook 提出的 flux 架构

  1. 用户访问 View
  2. View 发出用户的 Action
  3. Dispatcher 收到 Action， 要求 Store 进行相应的更新
  4. Store更新后， 发出一个 “change” 事件
  5. View 收到 "change" 事件后， 更新页面
