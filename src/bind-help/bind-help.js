import React from 'react';
import ReactDOM from 'react-dom';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

var NoLink = React.createClass({
  getInitialState: function(){
    return {message: 'Hello!'};
  },

  handleChange: function(event){
    this.setState({message: event.target.value});
  },

  render: function(){
    var message = this.state.message;
    return <input type="text" value={message} onChange={this.handleChange}/>
  }
})

ReactDOM.render(
  <NoLink/>,
  document.getElementById('nolink')
)

var WithLink = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function() {
    return {message: 'Hello!'};
  },
  render: function() {
    var valueLink = this.linkState('message');
    var handleChange = function(e) {
      valueLink.requestChange(e.target.value);
    };
    return <input type="text" value={valueLink.value} onChange={handleChange} />;
  }
});

ReactDOM.render(
  <WithLink/>,
  document.getElementById('withlink')
)
