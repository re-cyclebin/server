const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect

chai.use(chaiHttp);

describe('env variable ', _ => {
  let MONGO
  it('should return nothing', done => {
    if(process.env.NODE_ENV  === 'testing') MONGO = process.env.MONGODB_TESTING;
    expect(MONGO).to.be.a('string');
    expect(MONGO).to.equal(process.env.MONGODB_TESTING);
    expect(MONGO).not.to.equal(process.env.MONGODB_URL);
    done();
  })
})