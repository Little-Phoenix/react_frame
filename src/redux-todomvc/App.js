import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as TodoActions from './actions/action';
import { bindActionCreators } from 'redux';
import Header from './components/Header'
import Todo from './components/TodoItem'



const App = ({todos, actions}) => (
  <div>
    <Header addTodo={actions.addTodo}/>
    <Todo todos={todos} actions={actions}/>
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
