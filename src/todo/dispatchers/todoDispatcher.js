import ReactDispatcher from 'flux-react-dispatcher';
import TodoStore from '../stores/todoStore';

var Dispatcher = new ReactDispatcher();

var storeA = {
  data: {},
  handleData: function(payload){
    this.data = payload.data
  },
  dispatch: function(payload, waitFor){
    switch(payload.actionType){
      case 'ADD_ITEM':
        TodoStore.addItem(payload.text);
        TodoStore.emitChange();
        break;
      case 'REMOVE_ITEM':
        TodoStore.removeItem(payload.text);
        TodoStore.emitChange();
        break;
    }
  }
}

Dispatcher.register(storeA, storeA.dispatch);
module.exports = Dispatcher;
