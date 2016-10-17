import React from 'react';
import ListStore from '../store/ListStore.js';
import ButtonActions from '../actions/ButtonAction';
import MyButton  from "./MyButton";


var MyButtonController = React.createClass({
  getInitialState: function(){
    return {
      items: ListStore.getAll()
    }
  },

  createNewItem: function(event){
    ButtonActions.addNewItem('new item');
  },
  _onChange: function(){
    this.setState({
      items: ListStore.getAll()
    });
  },
  componentDidMount: function(){
    ListStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    ListStore.removeChangeListener(this._onChange);
  },

  render: function(){
    return <MyButton items={this.state.items} clickBtn={this.createNewItem}/>
  }
})


module.exports = MyButtonController;
