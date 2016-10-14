import ReactDispatcher from 'flux-react-dispatcher';
import ListStore from '../store/ListStore';


var AppDispatcher = new ReactDispatcher();

var storeA = {
  data: {},
  handleData: function(payload){
    this.data = payload.data
  },
  dispatch: function(payload, waitFor){
    switch(payload.actionType){
      case 'ADD_NEW_ITEM':
        ListStore.addNewItemHandler(payload.text);
        ListStore.emitChange();
        break;
    }
  }
}

AppDispatcher.register(storeA, storeA.dispatch)

module.exports = AppDispatcher;
