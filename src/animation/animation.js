import ReactCssTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import ReactDOM from 'react-dom';

var TodoList = React.createClass({
  getInitialState: function(){
    return {
      items: ['hello', 'world', 'click', 'me']
    };
  },

  handleAdd: function(){
    var newItems = this.state.items.concat([prompt('Enter some text')]);
    this.setState({items: newItems});
  },

  handleRemove: function(){
    var newItems = this.state.items.slice();
    newItems.splice(0, 1);
    this.setState({items: newItems});
  },

  render: function(){
    var items = this.state.items.map(function(item, i){
      return (
        <div key={item} onClick={this.handleRemove.bind(this, i)}>
          {item}
        </div>
      );
    }.bind(this));

    return (
      <div>
        <button onClick={this.handleAdd}>Add Item</button>
        <ReactCssTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          {items}
        </ReactCssTransitionGroup>
      </div>
    )
  }
})


ReactDOM.render(
  <TodoList/>,
  document.getElementById('root')
)
