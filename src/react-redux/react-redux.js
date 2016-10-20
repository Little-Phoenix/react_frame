import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import ValueComp from './ValueComp'

class Counter extends Component {
  render(){
    const { value, onIncreaseClick, onDecreaseClick } = this.props;
    return (
      <div>
        <ValueComp value={value}/>
        <button onClick={onIncreaseClick}>Increase</button>
        <button onClick={onDecreaseClick}>Decrease</button>
      </div>
    )
  }
}

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  onIncreaseClick: PropTypes.func.isRequired,
  onDecreaseClick: PropTypes.func.isRequired
}


const increaseAction = { type: 'increase' }
const decreaseAction = { type: 'decrease' }

function counter( state = { count: 0 }, action){
  const count = state.count;
  switch (action.type){
    case 'increase':
      return { count : count + 1 };
    case 'decrease':
      return { count : count - 1 };
    default:
      return state
  }
}

const store = createStore(counter)

function mapStateToProps (state) {
  return {
    value: state.count
  }
}

function mapDispatchToProps(dispatch){
  return {
    onIncreaseClick: () => dispatch(increaseAction),
    onDecreaseClick: () => dispatch(decreaseAction)
  }
}


const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
