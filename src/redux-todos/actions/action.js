let nextTodo = 0;
export const addTodo = (text) => ({
  type: 'ADD_TOD',
  id: nextTodo ++,
  text
})

export const setVisiblilityFilter = (filter) => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

export const toggleTodo = (id) => ({
  type: 'TOGGLE_TODO',
  id
})
