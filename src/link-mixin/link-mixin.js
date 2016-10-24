import LinkedStateMixin from 'react-addons-linked-state-mixin';
import React from 'react';
import ReactDOM from 'react-dom';

var WithLink = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function() {
    return {message: 'Hello!'};
  },
  render: function() {
    return <input type="text" valueLink={this.linkState('message')} />;
  }
});
