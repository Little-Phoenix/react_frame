## Redux

### 设计思想
	web应用是一个状态机， 视图与状态是一一对应的所有的状态，保存在一个对象里面
#### Store
	Store就是保存数据的地方，可以把它看成一个容器，整个应用只能一个Store。

	import {createStore} from 'redux';
	const store = createStore(fn);

	上面的代码中，createStore函数接受另一个函数作为参数，返回新生成的Store对象。

#### State
	Store对象包含所有数据。State可以通过store.getState()拿到。

	import { createStore } from 'redux';
	const store = createStore(fn);

	const state = store.getState();

	一个State对应一个View，只要State相同，View就相同。

#### Action
	State的变化，会导致View的变化，但是，用户接触不到State，只能接触到View。所以，State的变化必须是View导致的。
	Action就是View发出的通知，表示State应该要发生变化了。

	Action是一个对象。其中的type属性是必须的，表示Action的名称。其他属性可以自由设置。

		const action = {
			type: 'ADD_TODO',
			payload: 'Learn Redux'
		};

	上面的代码中，Action的名称是ADD_TODO，它携带的信息是字符串Learn Redux。
	可以这样理解，Action描述当前发生的事情。改变State的唯一办法，就是使用Action。它会运送数据到Store。

#### Action Creator
	View要发送多少种消息，就会有多少中Action。如果都手写，会很麻烦。可以定义一个函数来生成Action，这个函数就交Action Creator

		const ADD_TODO = '添加 TODO';

		function addTodo(text){
			return {
				type: ADD_TODO,
				text
			}
		}

		const action = addTodo('Learn Redux');

#### store.dispatch()
	store.dispatch()是View发出Action的唯一方法

		import { createStore } from 'redux';
		const store = createStore(fn);

		store.dispatch({
			type: 'ADD_TODO',
			payload: 'Learn Redux'
		});

	上面的代码中，store.dispatch接受一个Action对象作为参数，将它发送出去。结合Action Creator，这段代码可以改写如下：

		store.dispatch(addTodo('Learn Redux'))
