import shallowCompare from 'react-addons-shallow-compare';
import React from 'react'
import ReactDOM from 'react-dom'

export class SampleComponent extends React.Component{

  shouldComponentUpdate(nextProps, nextState){
    return shallowCompare(this, nextProps, nextState);
  }

  render(){
    return <div className={this.props.className}>foo</div>;
  }
}

ReactDOM.render(
  <SampleComponent className="shallow"/>,
  document.getElementById('root')
)
