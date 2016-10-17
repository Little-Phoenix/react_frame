import React from 'react';
import todoStore from '../stores/todoStore'
import todoAction from '../actions/todoAction'

export default class todo extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      items: []
    }
  }

  componentDidMount(){
    this.setState({
      items : todoStore.getAllItems()
    })
  }

  _onChange(){
    console.log('jfsji');
    this.setState({
      items: todoStore.getAllItems()
    })

    console.log('fasd');
  }

  //添加
  daibanAdd(){
    todoAction.addItem(this.refs.inputItem.value);
  }

  //列表
  daibanList(){

  }

  //删除
  daibanDelete(text, event){
    todoAction.removeItem(text)
  }

  componentDidMount(){
    todoStore.addChangeListener(this._onChange.bind(this));
  }

  componentWillUnMount(){
    todoStore.removeChangeListener(this._onChange.bind(this));
  }

  render(){
    var noneItemClass = this.state.items.length == 0 ? 'center none-item' : 'center'
    return (
      <div>
        <div className="top">
          <input type="text" className="input-txt" ref="inputItem"/>
          <input type="button" className="input-btn" value="确定" onClick={this.daibanAdd.bind(this)}/>
        </div>
        <div className={noneItemClass} >
          <ul>
            {
              this.state.items.map((item, index) => {
                return (
                  <li key={index}>{item.content}  <i className="icon-del" onClick={this.daibanDelete.bind(this, item.content)}>D</i></li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}
