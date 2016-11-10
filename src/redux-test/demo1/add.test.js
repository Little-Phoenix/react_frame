import add from './add.js'
import {expect} from 'chai'

describe('假发函数的测试', () => {
  it('1 加 1 应该等于2', () => {
    expect(add(1, 1)).to.be.equal(2);
  })
})
