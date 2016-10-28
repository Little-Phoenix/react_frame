import React, {Component, PropTypes} from 'react'

class Header extends Component{

  onSaveTodo = (e) => {
    var inputValue = this.refs.input.value;
    if(e.which === 13){
      this.props.addTodo(inputValue);
      this.refs.input.value = '';
    }

  }

  render(){
    return (
      <div>
        <h1>TODOS</h1>
        <input type = "text"
               placeholder = "请输入待办信息"
               ref = 'input'
               onKeyDown = {this.onSaveTodo}/>
      </div>
    )
  }
}

export default Header
