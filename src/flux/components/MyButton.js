import React from 'react';

export default class MyButton extends React.Component{


  btnClick(event){
    this.props.onClick();
  }

  render(){
    var items = this.props.items;
    var itemHtml = items.map(function(listItem, i){
      return <li key={i}>{listItem}</li>
    })
    return <div>
      <ul>{itemHtml}</ul>
      <button onClick={this.btnClick}>New Item</button>
    </div>
  }
}
