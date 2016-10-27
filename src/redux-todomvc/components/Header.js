import React from 'react'

const Header = (addTodo) => (
  <div>
    <h1>TODOS</h1>
    <input type = "text"
           placeholder = "请输入待办信息"
           onKeyDown = {addTodo}/>
  </div>
)

export default Header
