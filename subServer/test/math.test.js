const chai = require('chai'),
  ept = chai.expect,
  { rewardOne, rewardTwo, rewardThree, rewardFour, rewardFive } = require('../function/math')

describe('checking function One', _ => {
  describe('success math', _ => {
    it('should return 2000', done => {
      let test = rewardOne(12000)
      ept(test).to.be.a('number');
      ept(test).to.equal(2000);
      done()
    })
    it('should return 2000 because not enough', done => {
      let newNum = rewardOne(4000);
      ept(newNum).to.be.a('number');
      ept(newNum).to.equal(4000);
      done()
    })
  })
})
describe('checking function Two', _ => {
  describe('success math', _ => {
    it('should return 2000', done => {
      let test = rewardTwo(22000)
      ept(test).to.be.a('number');
      ept(test).to.equal(2000);
      done()
    })
    it('should return 2000 because not enough', done => {
      let newNum = rewardTwo(4000);
      ept(newNum).to.be.a('number');
      ept(newNum).to.equal(4000);
      done()
    })
  })
})
describe('checking function three', _ => {
  describe('success math', _ => {
    it('should return 2000', done => {
      let test = rewardThree(32000)
      ept(test).to.be.a('number');
      ept(test).to.equal(2000);
      done()
    })
    it('should return 2000 because not enough', done => {
      let newNum = rewardThree(4000);
      ept(newNum).to.be.a('number');
      ept(newNum).to.equal(4000);
      done()
    })
  })
})
describe('checking function four', _ => {
  describe('success math', _ => {
    it('should return 2000', done => {
      let test = rewardFour(52000)
      ept(test).to.be.a('number');
      ept(test).to.equal(2000);
      done()
    })
    it('should return 2000 because not enough', done => {
      let newNum = rewardFour(4000);
      ept(newNum).to.be.a('number');
      ept(newNum).to.equal(4000);
      done()
    })
  })
})
describe('checking function five', _ => {
  describe('success math', _ => {
    it('should return 2000', done => {
      let test = rewardFive(102000)
      ept(test).to.be.a('number');
      ept(test).to.equal(2000);
      done()
    })
    it('should return 2000 because not enough', done => {
      let newNum = rewardFive(4000);
      ept(newNum).to.be.a('number');
      ept(newNum).to.equal(4000);
      done()
    })
  })
})