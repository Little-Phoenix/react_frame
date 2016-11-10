// import { expect } from 'chai'
var expect = require('chai').expect
var expect2 = require('expect')

describe('hello world', () => {
  it('works!', () => {
    expect(true).to.be.true;
  })
})


function addTodo(text){
  return {
    type: 'ADD_TODO',
    text
  }
}

describe ('action', () => {
  it('should create an action to add a todo', () => {
    const text = 'Finish docs'
    const expectedAction = {
      type: 'ADD_TODO',
      text
    }

    expect2(addTodo(text)).toEqual(expectedAction)
  })
})
