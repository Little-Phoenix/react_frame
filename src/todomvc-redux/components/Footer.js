import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

export default class Footer extends Component{
  static propTypes = {
    completedCount: PropTypes.number.isRequired,
    activeCount: PropTypes.number.isRequired,
    filter: PropTypes.number.isRequired,
    onClearCompleted: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired
  }

  renderTodoCount(){
    const { activeCount } = this.props;
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    )
  }

  renderClearButton(){
    const { completedCount, onClearCompleted } = this.prop
    if(completedCount > 0){
      return (
        <button className="clear-completed"
                onClick={onClearCompleted}>
          Clear completed
        </button>
      )
    }
  }

  render(){
    return (
      <footer className="footer">
        {this.renderTodoCount()}
        <ul className="filters">
          {
            [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map( filter =>
              <li key={filter}>
                {this.renderFilterLink(filter)}
              </li>
            )
          }
        </ul>
        {this.renderClearButton()}
      </footer>
    )
  }
}
