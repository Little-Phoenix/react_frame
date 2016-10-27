import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as TodoActions from './actions/action';
import { bindActionCreators } from 'redux';



const App = ({todos, dispatch}) => (
  <div>
    <div>{todos}</div>
    <div>{dispatch}</div>
  </div>
)

App.propTypes = {
  todos: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  todos: state.todos
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(TodoActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
