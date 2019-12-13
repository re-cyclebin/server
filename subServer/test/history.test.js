const chai = require('chai'),
  chaiHttp = require('chai-http'),
  app = require('../app'),
  { Trash, User, History } = require('../models'),
  { jwt } = require('../helpers'),
  { signToken } = jwt

chai.use(chaiHttp);
const expect = chai.expect;

let initialTokenPull = '',
  initialIdUserPull = '',
  initialTrashId = '',
  initialTokenUser = '',
  initialHistory = '',
  initialTokenAdmin = '',
  falseToken = 'efjafenpwfnafnmioj23-'

before(done => {
  const dummyUserPuller = { username: 'bambang', email: 'bambang@gmail.com', password: 'PullerN', role: 'puller' };
  User.create(dummyUserPuller)
    .then(user => {
      initialIdUserPull = user._id
      return Trash.create({ location: { longitude: '500', latitude: '121' } })
    })
    .then(trash => {
      initialTrashId = trash._id
      return History.create({ Puller: initialIdUserPull, TrashId: initialTrashId, height: '100', weight: '20' })
    })
    .then(history => {
      initialHistory=history;
      return User.create({ username: 'userRole', email: 'userRole@gmail.com', password: 'USERROLE' })
    })
    .then(user => {
      const tokenUser = signToken({ id: user._id, username: user.username, email: user.email })
      initialTokenUser = tokenUser
      return User.create({ username: 'admin', email: 'admin@gmail.com', password: 'Adminssd', role: 'admin' })
    })
    .then(user => {
      const tokenAdmin = signToken({ id: user._id, username: user.username, email: user.email })
      initialTokenAdmin = tokenAdmin;
      done()
    })
    .catch(console.log)
})

after(done => {
  if(process.env.NODE_ENV == 'testing') {
    User.deleteMany({})
      .then(_ => {
        return Trash.deleteMany({})
      })
      .then(_ => {
        return Hisotry.deleteMany({})
      })
      .then(_ => { console.log('successfully deleting'); done() })
      .catch(console.log)
  }
})

describe('Testing for History trashcan up', _ => {
  describe('POST /history/:id (trashId)', _ => {
    let newHistory = {
      height: 50,
      weight: 25
    }
    let link = '/history/';
    describe('success process create History', _ => {
      it('should send an object history with 201 status code', done => {
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .send(newHistory)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('history');
            expect(res.body.history).to.be.an('object').to.have.any.keys('_id', 'Puller', 'TrashId', 'height', 'weight');
            expect(res.body.history.height).to.be.a('number');
            expect(res.body.history.weight).to.be.a('number');
            expect(res.body.history._id).to.be.a('string');
            expect(res.body.history.TrashId).to.be.a('string');
            expect(res.body.hisotry.Puller).to.be.a('string');
            done()
          })
      })
    })
    describe('error process create History', _ => {
      it('should send an object (msg, errors) with 400 status code because missing height', done => {
        const noHeight = { ...newHistory };
        delete noHeight.height;
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .send(noHeight)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            expect(res.body.errors).to.be.an('array').that.includes('height is required');
            done()
          })
      })
      it('should send an object ( msg, errors) with 400 status code because missing weight', done => {
        const noWeight = { ...newHistory };
        delete noWeight.weight;
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .send(noWeight)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            expect(res.body.errors).to.be.an('array').that.includes('weight is required');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because authorization error', done => {
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenUser)
          .send(newHistory)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because jwt malformed', done => {
        chai  
          .request(app)
          .post(link+initialTrashId)
          .set('token', falseToken)
          .send(newHistory)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed');
            done();
          })
      })
      it('should send an object (msg) with 403 status code because missing token', done => {
        chai  
          .request(app)
          .post(link+initialTrashId)
          .send(newHistory)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object (msg) with 400 status code because worng type data of height', done => {
        const typeString = { height: 'fwfwef', weight: 40 };
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .send(typeString)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid input type data')
            done()
          })
      })
      it('should send an object (msg) with 400 status code because worng type data of weight', done => {
        const typeStirngWeight = { height: 120, weight: 'fwfweffw' };
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .send(typeStirngWeight)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid input type data')
            done()
          })
      })
    })
  })

  describe('GET /history', _ => {
    let link = '/history'
    describe('success process for get all history', _ => {
      it('should send an object histories', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('histories');
            expect(res.body.histories).to.be.an('array');
            expect(res.body.histories[0]).to.be.an('object').to.have.any.keys('_id', 'Puller', 'TrashId', 'height', 'weight');
            
          })
      })
    })
  })
})