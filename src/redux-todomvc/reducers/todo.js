import React from 'react';
import * as Type from '../constants/Todo'

const initState = [
  {
    id: 0,
    text: 'firstTodo',
    completed: false
  }
]

export default function todos(state = initState, action) {
  switch (action.type) {
    case Type.ADD_TODO:
      return [
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        },
        ...state
      ]
    case Type.DELETE_TODO:
      return state.filter(
        todo => todo.id !== action.id
      )
    case Type.EDIT_TODO:
      return state.map(
        todo => todo.id === action.id ? {...todo, text: action.text} : todo
      )
    case Type.COMPLETED_TODO:
      return state.map(
        todo => todo.id === action.id ? {...todo, completed: true} : todo
      )
    case Type.COMPLETED_ALL:

      var areAllMarked = state.every(todo => todo.completed)
      return state.map(
        todo => ({...todo, completed: !areAllMarked})
      )

    case Type.CLEAR_COMPLETED:
      return state.filter(
        todo => todo.completed === false
      )
    default:
      return state
  }
}
