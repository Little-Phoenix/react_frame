var add = require('./add.js')
var expect = require('chai').expect;

describe('加法函数的测试', () => {
  it('1 + 1 应该等于 2', () => {
    expect(add(1, 1)).to.be.equal(2)
  })

  it('3 + 4 应该等于 7', () => {
    expect(add(3, 4)).to.be.equal(7)
  })
})
