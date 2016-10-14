import React from 'react';

export default class MyButton extends React.Component{

  constructor(props){
    super(props)
  }

  btnClick(event){
    this.props.clickBtn();
  }

  render(){
    var items = this.props.items;
    var itemHtml = items.map(function(listItem, i){
      return <li key={i}>{listItem}</li>
    })
    return <div>
      <ul>{itemHtml}</ul>
      <button onClick={this.btnClick.bind(this)}>New Item</button>
    </div>
  }
}
