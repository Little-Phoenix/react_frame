import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { Router, Route, hashHistory } from 'react-router'

render((
  <Router history={hasHistory}>
    <Route path="/" component={App}/>
  </Router>
), document.getElementById('app'))
