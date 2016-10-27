import {ADD_TODO, DELETE_TODO, EDIT_TODO, COMPLETED_TODO, COMPLETED_ALL, CLEAR_COMPLETED} from '../constants/Todo'

export const addTodo = text => ({type: ADD_TODO, text})
export const deleteTodo = id => ({type: DELETE_TODO, id})
export const editTodo = (id, text) => ({type: EDIT_TODO, id, text})
export const completedTodo = id => ({type: COMPLETED_TODO, id})
export const completedAll = () => ({type: COMPLETED_ALL})
export const clearCompleted = () => ({type: CLEAR_COMPLETED})
