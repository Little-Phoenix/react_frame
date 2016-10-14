var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ListStore = {
  items: [],

  getAll: function(){
      return this.items;
  },

  addNewItemHandler: function(text){
    this.items.push(text);
    console.log(this.items);
  },

  emitChange: function(){
    // this.emit('change');
    EventEmitter.emit('change');
  },

  addChangeListener: function(callback){
    // this.on('change', callback);
  },

  removeChangeListener: function(callback){
    this.removeListener('change', callback);
  }
}

module.exports = ListStore;
