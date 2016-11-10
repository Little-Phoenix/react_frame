# 编写测试
  因为你写的大部分Redux代码都是些函数，而且大部分是纯函数，所以很好测，不需要模拟

## 设置
  用Mocha作为测试引擎。<br>
  注意因为是在node环境下运行，所以不能访问DOM
    npm install --save-dev mocha

  若想结合 Babel 使用，在package.json 的scripts 里加入这一段：
    {
      ...
      "scripts": {
        ...
        "test": "mocha --compilers js:babel/register --recursive",
        "test:watch": "npm test -- --watch",
      },
      ...
    }
  然后运行 npm test 就能单词运行了， 或者也可以使用 npm run test:watch 在每次有文件改变时自动执行测试。

## Action Creators
  Redux 里的 action creators 是会返回普通对象的函数。在测试 action creators 的时候我们想要测试不仅是调用了正确的 action creator，还有是否返回了正确的 action.

### 示例
    export function addTodo(text){
      return {
        type: 'ADD_TODO',
        text
      }
    }

  可以这样测试：
    import expect from 'expect'
    import * as actions from '../../actions/TodoActions'
    import * as types from '../../constants/ActionTypes'

    describe('action', () => {
      it('should create an action to add a todo', () => {
        const text = 'Finish docs'
        const expectedAction = {
          type: types.ADD_TODO,
          text
        }
        expect(actions.addTodo(text)).toEqual(expectedAction)
      })
    })

## 异步 Action Creators
  对于使用 Redux Thunk 或其它中间件的异步action creator，最好完全模拟Redux store 来测试。你可以使用 applyMiddleware()和一个模拟的store，如下所示（可在redux-mock-store中找到以下代码）。也可以使用 nock 来模拟HTTP请求

### 示例
    function fetchTodosRequest(){
      return {
        type: FETCH_TODOS_REQUEST
      }
    }

    function fetchTodosSuccess(body){
      return {
        type: FETCH_TODOS_SUCCESS,
        body
      }
    }

    function fetchTodosFailure(ex){
      return {
        type: FETCH_TODOS_FAILURE,
        ex
      }
    }

    export function fetchTodos(){
      return dispatch => {
        dispatch(fetchTodosRequest())
        return fetch('http://example.com/todos')
          .then(res => res.json())
          .then(json => dispatch(fetchTodosSuccess(json.body)))
          .catch(ex => dispatch(fetchTodosFailure(ex)))
      }
    }
