import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectReddit, fetchPostsIfNeeded, invalidateReddit } from './action'
import Picker from './components/Picker'
import Posts from './components/Posts'

class App extends Component{
  static propTypes = {
    selectedReddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired
  }

  componentDidMount(){
    const { dispatch, selectedReddit } = this.props
    console.log('componentDidMount ' + selectedReddit);
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  componentWillReceiveProps(nextProps){
    console.log('componentWillReceiveProps change ' + nextProps.selectedReddit );
    if(nextProps.selectedReddit !== this.props.selectedReddit){
      const { dispatch, selectedReddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedReddit))
    }
  }

  handleChange = nextReddit => {
    //picker  change
    console.log('picker change ' + nextReddit)
    this.props.dispatch(selectReddit(nextReddit))
  }

  handleRefreshClick = e => {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  render(){
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedReddit}
                onChange={this.handleChange}
                options={['reactjs', 'frontend']}/>
        <p>
          {
            //lastUpdated如果有值，则返回&&后面的值，否则返回lastUpdated
            lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {
            !isFetching &&
            <a href="#"
               onClick={this.handleRefreshClick}>
               Refresh
            </a>
          }
        </p>
        {
          isEmpty ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
              <Posts posts={posts}/>
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  console.log('mapStateToProps ' + state);
  const { selectedReddit, postsByReddit } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(App)
