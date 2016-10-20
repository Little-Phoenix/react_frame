import React, { Component } from  'react'

class ValueComp extends Component{
  render (){
    const { value } = this.props;
    return (
      <span>{value}</span>
    )
  }
}

export default ValueComp
