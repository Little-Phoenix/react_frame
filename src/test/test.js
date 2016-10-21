import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect'



class Test extends React.Component{
  render(){
    return (
      <div>
        <span className="heading">Title</span>
        // <input ref="input"/>
      </div>
    )
  }
  componentDidMount(){
    // var node = this.refs.input;
    // node.value = 'giraffe';
    // ReactTestUtils.Simulate.change(node);
    // ReactTestUtils.Simulate.keyDown(node, {key: 'Enter', keyCode: 13, which: 13})

    var renderer = ReactTestUtils.createRenderer();
    var result = renderer.getRenderOutput();
    console.log(result);
    expect(result.type).toBe('div');
    expect(result.props.children).toEqual([
      <span className="heading">Title</span>
    ])
  }
}

ReactDOM.render(
  <Test/>,
  document.getElementById('root')
)
