import React, { Component, PropTypes } from 'react'


class TodoItem extends Component{

  completedTodo = () => {
    this.props.completedTodo(this.props.todo.id)
  }

  render(){
    var todo = this.props.todo
    return (
      <li onClick={this.completedTodo} className={todo.completed ? 'completed' : ''}>
        {todo.text}
      </li>
    )
  }
}

class Todo extends Component{
  render(){
    var items = [];

    this.props.todos.forEach((item, i) => {

      items.push(
        <TodoItem todo={item} {...this.props.actions} key={i}/>
      )
    })
    return (
      <ul>
        {items}
      </ul>
    )
  }
}

export default Todo
