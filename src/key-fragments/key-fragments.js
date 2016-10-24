import createFragment from 'react-addons-create-fragment'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

function Swapper(props) {
  let children;
  if (props.swapped) {
    children = createFragment({
      right: props.rightChildren,
      left: props.leftChildren
    });
  } else {
    children = createFragment({
      left: props.leftChildren,
      right: props.rightChildren
    });
  }
  return <div>{children}</div>;
}

class ChildrenDiv extends Component{
  render(){
    return Swapper(this.props);
  }
}

ReactDOM.render(
  <ChildrenDiv swapped={false} leftChildren="left " rightChildren="right "/>,
  document.getElementById('root')
)
