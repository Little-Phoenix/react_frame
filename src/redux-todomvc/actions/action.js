import {ADD_TODO, DELETE_TODO, EDIT_TODO, COMPLETED_TODO, COMPLETED_ALL, CLEAR_COMPLETED} from '../constants/Todo'

export default addTodo = text => ({type: ADD_TODO, text})
export default deleteTodo = id => ({type: DELETE_TODO, id})
export default editTodo = (id, text) => ({type: EDIT_TODO, id, text})
export default completedTodo = id => ({type: COMPLETED_TODO, id})
export default completedAll = () => ({type: COMPLETED_ALL})
export default clearCompleted = () => ({type: CLEAR_COMPLETED})
