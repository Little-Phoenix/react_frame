import { createStore } from 'redux'
import { createAction, createReducer } from 'redux-act'

const add = createAction('add some duff');
const increment = createAction('增加 increment')
const decrement = createAction('减小 decrement')

const counterReducer = createReducer({
  [increment] : (state) => state + 1,
  [decrement] : (state) => state - 1,
  [add]: (state, payload) => state + payload,
}, 0);

const counterStore = createStore(counterReducer);
counterStore.dispatch(increment())
console.log(counterStore.getState());
counterStore.dispatch(increment())
console.log(counterStore.getState())
counterStore.dispatch(decrement())
console.log(counterStore.getState())
counterStore.dispatch(add(5))
console.log(counterStore.getState());
