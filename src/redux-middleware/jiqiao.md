# 减少样板代码
  Redux很大部分 受到 Flux 的启发， 而最常见的关于 Flux 的抱怨是必须写一大堆的模板。而在这章技巧中，根据个人样式，团队选线，长期可维护等等因素，Redux可以让我们自由决定代码的繁复程度。

# Actions
  Actions是用来描述在 app 中发生了什么的普通对象，是描述对象变异意图的唯一途径。很重要的一点是`必须分发的action对象并非模板，而是Redux的一个基本设计选项`。<br>

  不少框架生成自己和Flux很像，只不过缺少了 action 对象的概念。但可预测的是，这是从 Flux 或 Redux 的倒退。如果没有可序列化的普通对象 action,遍无法记录或重演用户会话，也无法实现 带有时间旅行的热重载。如果你更喜欢直接修改数据，那你并不需要使用Redux。<br><br>

  Action 一般长这样：
    { type: 'ADD_TODO', text: 'Use Redux' }
    { type: 'REMOVE_TODO', id: 42 }
    { type: 'LOAD_ARTICLE', response: { ... } }

  一个约定俗称的做法是，actions 拥有一个常量 type 帮助 reducer (或Flux中的Stores) 识别它们。我们建议你使用string 而不是 Symbols 作为 action type，因为string是可序列化的，而使用 Symbols 会毫无必要地使记录和重演变得困难。<br>

  在Flux中，传统的想法是将每个 action type 定义为 string 常量：
    const ADD_TODO = 'ADD_TODO'
    const REMOVE_TODO = 'REMOVE_TODO'
    const LOAD_ARTICLE = 'LOAD_ARTICLE'

  这么做的优势？ `人们通常称常量不是必要的。对于小项目也许正确。` 对于大的项目，将 action types 定义为常量有如下好处：
    * 帮助维护命名一致性，因为所有的 action type 汇总在同一位置。
    * 有时，在开发一个新功能之前你想看到所有现存的 actions。而你的团队里可能已经有人添加了你所需要的action，而你并不知道
    * Action types 列表在 Pull Request 中能查到所有添加，删除，修改的记录。这能帮助团队中的所有人及时追踪新功能的范围与实现。
    * 如果你在导入一个 Action 常量的时候拼写错误，你会得到 `undefined`。 当你纳闷 action 被分发出去儿什么也没发生的时候，一个拼写错误更容易被发现。

  你的项目的约定取决与你自己。开始时，可能用的是 inline string，之后转为常量，也许之后将他们归为一个独立文件。Redux不会给予任何建议，选择你自己最喜欢的。

# Action Creators
  另一个约定俗成的做法，通过创建函数生成 action 对象，而不是在你分发的时候内联生成它们。<br>
  Action creators 总被当作模板受到批评。好吧，其实你并不非得把他们写出来！`如果你觉得更适合你的项目，你可以选用对象文字`，然而，你应该知道写 action creators 是存在某种优势的。<br>

  假设有个设计师看完我们的原型之后回来说，我们最多只允许三个todo。我们可以使用 redux-thunk 中间件，并添加一个提前退出，把我们的 action creator 重写成回调形式：
    const addTodoWithoutCheck = (text) => ({ type: 'ADD_TODO', text })

    const addTodo = (text) => ((dispatch, getState) => {
      if(getState().todos.length === 3){
        return;
      }
      dispatch(addTodoWithoutCheck(text))
    })

  我们刚刚修改了`addTodo` action creator 的行为，使得它对调用它的代码完全不可见。`我们不用担心去每个添加todo的地方看一看，以确认他们有了这个检查` Action creator 让你可以解耦额外的分发action 逻辑与实际发送这些 action 的components。 当你有大量开发工作且需求经常变更的时候，这种方法时分简便易用。

# 生成 Action Creators
  某些框架如 Flummox 自动从 action creator 函数定义生成 action type 常量。这个想法是说你不需要同时定义 ADD_TODO 常量和 addTodo() action creator.这样的方法在底层也生成了action type常量，但他们是隐式生成的、间接级，会造成混乱。因此我们建议直接清晰地创建 action type 常量<br>

  写简单的 action creator 很容易让人厌烦，且往往最终生成多余的样板代码:
    const addTodo = (text) => ({type: 'ADD_TODO', text})
    const editTodo = (id, text) => ({type: 'EDIT_TODO', id, text})
    const removeTodo = (id) => ({type: 'REMOVE_TODO', id})

  你可以写一个用于生成action creator 的函数
    function makeActionCreator(type, ...argNames){
      return function (...args){
        let action = {type}
        argNames.forEach((arg, index) => {
          action[argNames[index]] = args[index]
        })
        return action
      }
    }

    const ADD_TODO = 'ADD_TODO'
    const EDIT_TODO = 'EDIT_TODO'
    const REMOVE_TODO = 'REMOVE_TODO'

    export const addTodo = makeActionCreator(ADD_TODO, 'todo')
    export const editTodo = makeActionCreator(EDIT_TODO, 'id', 'todo')
    export const removeTodo = makeActionCreator(REMOVE_TODO, 'id')

# 异步Action Creators
  中间件 让你在每个action对象分发出去之前，注入一个自定义的逻辑来解释你的action对象。异步action是中间件的最常见用例。<br>
  如果没有中间件，dispatch 只能接受一个普通对象。因此我们必须在components里面进行AJAX 调用 <br>

  中间件让我们能写表达更清晰的、潜在的异步 action creators

# Reducers
  Redux 用函数描述逻辑更新减少了模板里大量的 Flux stores。函数比对象简单，比类更简单的多。
