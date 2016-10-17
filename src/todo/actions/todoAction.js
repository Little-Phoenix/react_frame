import AppDispatcher from '../dispatchers/todoDispatcher'

var TodoActions = {
  addItem: function(text){
    AppDispatcher.dispatch({
      actionType: 'ADD_ITEM',
      text: text
    })
  },

  removeItem: function(text){
    AppDispatcher.dispatch({
      actionType: 'REMOVE_ITEM',
      text: text
    })
  }
}

module.exports = TodoActions;
