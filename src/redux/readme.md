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


### Reducer
	Store收到Action以后，必须给出一个新的State，这样View才会发生变化。这种State的计算过程就叫做Reducer。Reducer是一个函数，它接受Action和当前State作为参数，返回一个新的State。

		const defaultState = 0;
		const reducer = (state = defaultState, action) => {
			switch(action.type){
				case 'ADD':
					return state + action.payload;
				default:
					return state;
			}
		};

		const state = reducer(1, {
			type: 'ADD',
			payload: 2
		});
	上面代码中，reducer函数收到名为ADD的Action后，就会返回一个新的State，最为加法的计算结果。其他运算的逻辑（比如减法），也可以根据Action的不同来实现。

	实际应用中，Reducer函数不用像上面这样手动调用，store.dispatch方法会出发Reducer的自动执行。为此，Store需要知道Reducer函数，做法就是在生成Store的时候，将Reducer传入createStore方法。

		import { createStore } from 'redux';
		const store = createStore(reducer);

	上面的代码中，createStore接受Reducer作为参数，生成一个新的Store。以后每当store.dispatch发送过来一个新的Action，就会自动调用Reducer，得到新的State。

		const actions = [
			{
				type: 'ADD', payload: 0
			},{
				type: 'ADD', payload: 1
			},{
				type: 'ADD', payload: 2
			}
		]

		const total = actions.reduce(reducer, 0);//3

	上面的代码中，数组actions表示依次有三个Action， 分别是加0、加1和加2。 数组的reduce方法接受Reducer函数作为参数，就可以值金额得到最终的状态3。

### 纯函数
	Reducer 函数最重要的特征是，它是一个纯函数。也就是说， 只要是同样的输入，必定得到同样的输出。
	纯函数是函数式编程的概念，必须遵守以下一些约束。

		不得改写参数
		不能调用系统I/O的API
		不能调用Data.now()或者Math.reandom等不纯的方法，因为每次会得到不一样的结果。

	由于Reducer是纯函数，就可以保证同样的State， 必定得到同样的View。 但也正因为这一点， Reducer 函数里面不能改变 State，必须返回一个全新的对象，请参考下面的写法：

		//state是一个对象
		function reducer(state, action){
			return Object.assign({}, state, { thingToChange });
			//或者
			return { ...state, ...newState }
		}

		//state是一个数组
		function reducer(state, action){
			return [...state, newItem];
		}

	最好把State对象设成只读。你没法改变它，要得到新的state，唯一办法就是生成一个新对象。这样的好处是，任何时候，与某个View对应的State总是一个不变的对象。


### store.subscribe()
	Store允许使用store.subscribe方法设置监听函数，一旦state发生变化，就自动执行这个函数。

		import{ createStore } from 'redux';
		const store = createStore(reducer);

		store.subscribe(listener);

	显然，只要把View的更新函数（对于React项目，就是组件的render方法或setState方法）放入listen，就会实现View的自动渲染。

	store.subscribe方法返回一个函数，调用这个函数就可以解除监听。

		let unsubscribe = store.subscribe(() =>
			console.log(store.getState())
		)

		unsubscribe();


## Store的实现
	上一节介绍了Redux涉及的基本概念， 可以发现Store提供了三个方法。

		store.getState()
		store.dispatch()
		store.subscribe()

		import { createStore } from 'redux';
		let { subscribe, dispatch, getState } = createStore(reducer);

	createStore方法还可以接受第二个参数，表示State的最初状态。这通常是服务器给出的。

		let store = createStore(todoApp, window.STATE_FROM_SERVER);

	上面代码中，window.STATE_FROM_SERVER 就是整个应用的状态初始值。注意，如果提供了这个参数，它会覆盖Reducer 函数的默认初始值。

	下面是createStore方法的一个简单实现， 可以了解一下Store 是怎么生成的。

		const createStore = (reducer) => {
			let state;
			let listeners = [];

			const getState = () => state;

			const dispatch = (action) => {
				state = reducer(state, action);
				listeners.forEach(listener => listener());
			};

			const subscribe = (listener) => {
				listeners.push(listener);
				return () => {
					listeners = listeners.filter( l => l !== listener);
				}
			};

			dispatch({});

			return { getState, dispatch, subscribe };
		}

## Reducer 的拆分
	Reducer函数负责生成State。由于整个应用只有一个State对象， 包含所有数据， 对于大型应用来说， 这个State必然十分庞大，导致Reducer函数也时分庞大

		const chatReducer = (state = defaultState, action = {}) => {
			const { type, payload } = action;

			switch(type){
				case ADD_CHAT:
					return Object.assign({}, state, {
						chatLog: state.chatLog.concat(payload)
					});
				case CHANGE_STATE:
					return Object.assign({}, state, {
						statusMessage: payload
					});
				case CHANGE_USERNAME:
					return Object.assign({}, state, {
						userName: payload
					});
				default: return state;
			}
		}

	上面代码中，三种 Action 分别改变 State 的三个属性

		ADD_CHAT: chatLog属性
		CHANGE_STATE: statusMessage属性
		CHANGE_USERNAME: userName属性

	这三个属性之间没有联系，这提示我们可以把 Reducer 函数拆分。不同的函数负责处理不同属性， 最终把它们合并成一个大的 Reducer 即可

		const chatReducer = (state = defaultState, action = {}) => {
			return {
				chatLog: chatLog(state.chatLog, action),
				statusMessage: statusMessage(state.statusMessage, action),
				userName: userName(state.userName, action)
			}
		}

	上面代码中，Reducer函数被拆成了三个小函数，每一个负责生成对应的属性。
	这样一拆， Reducer就易读易写多了。而且，这种拆分与React 应用结构相吻合： 一个React 根组件由很多子组件构成。 这就是说，子组件与子Reducer 完全可以对应。
	Redux提供了combineReducers 方法，用于 Reducer 的拆分。 你只要定义各个子Reducer函数， 然后用这个方法， 将它们合成一个大的Reducer

		import { combineReducers } from 'redux';

		const chatReducer = combineReducers({
				chatLog,
				statusMessage,
				userName
		})

		export default todoApp;

	上面代码同过 combineReducers 方法将三个子 Reducer 合并成一个大的函数。
	这种写法有一个前提，就是 State 的属性名必须与子 Reducer 同名。如果不同名， 就要采用下面的写法。

		const reducer = combineReducers({
			a: doSomethingWithA,
			b: processB,
			c: c
		})

		//等同于
		function reducer(state = {}, action) {
			return {
				a: doSomethingWithA(state.a, action),
				b: processB(state.b, action),
				c: c(state.c, action)
			}
		}

	总之， combineReducers()做的就是产生一个整体的Reducer函数，该函数根据State 的 key 去执行相应的子 Reducer ，并返回结果合并成一个大的 State 对象。

	下面是 combineReducers的简单实现：

		const combineReducers = reducer => {
			return (state = {}, action) => {
				return Object.keys(reducers).reduce(
						(nextState, key) => {
							nextState[key] = reducers[key](state[key], action);
							return nextState;
						},
						{}
				)
			}
		}

	你可以把所有子Reducer 放在一个文件里面，然后统一引入。

		import { combineReducers } from 'redux';
		import * as reducers from './reducers';

		const reducer = combineReducers(reducers)
