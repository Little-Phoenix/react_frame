import React from 'react';
import { render } from 'react-dom';
// import ReactRouter from 'react-router';
// import History from 'history';

import { Router, Route, Link, Redirect, IndexRoute } from 'react-router';
import { createHistory, useBasename } from 'history';


var BlogApp = React.createClass({
  render: function(){
    var pathname = this.props.location.pathname;
    return (
      <div className="blog-app">
        <ul>
          <li> <Link activeClassName="active" to="/archives">Archives</Link> </li>
          <li> <Link activeClassName="active" to="/about">About</Link> </li>
          <li> <Link activeClassName="active" to="/signIn">Sign in</Link> </li>
          <li> <Link activeClassName="active" to="/signOut">Sign out</Link> </li>
        </ul>
        { React.cloneElement(this.props.children || <div/>, {key: pathname })}
      </div>
    )
  }
})

var About = React.createClass({
  render: function() {
    return (
      <div className="about">
        <h1>About author</h1>
      </div>
    )
  }
})

var Archives = React.createClass({
  render: function() {
    return (
      <div>
        原创： <br/>
        {this.props.original}
        转载： <br/>
        {this.props.reproduce}
      </div>
    )
  }
})

var Original = React.createClass({
  render: function() {
    return (
      <div className="archives">
        <ul>
          {
            window.blogData.slice(0, 4).map(function(item, index) {
              return <li key={index} >
                <Link to={`/archives/${index}`}
                      query={{type: 'Original'}}
                      state={{title: item.title}}>
                      {item.title}
                </Link>
              </li>
            })
          }
        </ul>
      </div>
    )
  }
})

var Reproduce = React.createClass({
  render: function() {
    return (
      <div className="archives">
        <ul>
          {
            window.blogData.slice(4, 8).map(function(item, index) {
              return <li key={index} >
                <Link to={`/article/${index}`}
                      query={{type: 'Reproduce'}}
                      state={{title: item.title}}
                      hash="#hash">
                      {item.title}
                </Link>
              </li>
            })
          }
        </ul>
      </div>
    )
  }
})

var Article = React.createClass({
  render: function() {
    var id = this.props.params.id
    var location = this.props.location
    return (
      <div className="article">
        <h2> {loction.state.title} </h2>
        <br/><br/>
        这是文档归档 {location.query.type} 类目下的第 {++id} 文章，欢迎您的访问！
      </div>
    )
  }
})

var SignIn = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault()
    var email = React.findDOMNode(this.refs.name).value
    var pass = React.findDOMNode(this.refs.pass).value
    if(pass !== 'password'){
      return;
    }

    location.setItem('login', 'true');

    var location = this.props.location;

    if(location.state && location.state.nextPathname) {
      this.props.history.replaceState(null, location.state.nextPathname);
    } else {
      this.props.history.replaceState(null, '/about');
    }
  },

  render: function() {
    if( hasLogin() ){
      return <p> 你已经登录系统！<Link to="/signOut" > 点此退出 </Link></p>
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <label><input ref="name"/></label> <br/>
        <label><input ref="pass"/></label> (password)<br/>
        <button type="submit"> 登录 </button>
      </form>
    )
  }
})

var SignOut = React.createClass({
  componentDidMount: function() {
    localStorage.setItem('login', 'false')
  },

  render: function() {
    return <p>已经退出！</p>
  }
})

function hasLogin() {
  return localStorage.getItem('login') === 'true';
}

function requireAuth(nextState, replaceState) {
  if( !hasLogin() ) {
    replaceState({ nextPathname: nextState.location.pathname }, '/signIn')
  }
}

render((
  <Router>
    <Route path="/" component={BlogApp}>
      <IndexRoute component={SignIn}/>
      <Route path="signIn" component={SignIn}/>
      <Route path="signOut" component={SignOut}/>
      <Redirect from="/archives" to="/archives/posts"/>
      <Route onEnter={requireAuth} path="/archives" component={Archives}>
        <Route path="posts" components={{
          original: Original,
          reproduce: Reproduce
        }}/>
      </Route>

      <Route path="article/:id" component={Article}/>
      <Route path="about" component={About}/>
    </Route>
  </Router>
), document.getElementById('example'))
