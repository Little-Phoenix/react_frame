var EventEmitter =  require('events').EventEmitter;
var assign = require('object-assign');

var todoStore = assign({}, EventEmitter.prototype, {
  items: [],

  getAllItems: function(){
    return this.items;
  },

  emitChange: function(){
    this.emit('change');
  },

  removeItem: function(text){
    var newItems = []
    this.items.forEach(function(item){
      if(item.content != text){
        newItems.push(item);
      }
    });

    this.items = newItems;
  },

  addItem: function(text){
    var item = {content: text, date: +new Date};
    this.items.push(item);
  },

  addChangeListener: function(callback){
    this.on('change', callback);
  },

  removeChangeListener: function(callback){
    this.removeListener('change', 'callback')
  }

})

module.exports = todoStore;
