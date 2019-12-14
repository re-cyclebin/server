const chai = require('chai'),
  chaiHttp = require('chai-http'),
  app = require('../app'),
  { Trash, User, History } = require('../models'),
  { jwt } = require('../helpers'),
  { signToken } = jwt

chai.use(chaiHttp);
const expect = chai.expect;

let initialTokenPull = '',
  initialTrashId = '',
  initialTokenUser = '',
  initialHistory = '',
  initialTokenAdmin = '',
  falseToken = 'efjafenpwfnafnmioj23-',
  initialPullerId = ''

before(done => {
  const dummyUserPuller = { username: 'bambang', email: 'bambang@gmail.com', password: 'PullerN', role: 'puller' };
  User.create(dummyUserPuller)
    .then(userPull => {
      initialPullerId = userPull._id
      const tokenPuller = signToken({ id: userPull._id, username: userPull.username, email: userPull.email })
      initialTokenPull = tokenPuller;
      return Trash.create({ location: { longitude: '500', latitude: '121' } })
    })
    .then(trash => {
      initialTrashId = trash._id
      return User.create({ username: 'userRole', email: 'userRole@gmail.com', password: 'USERROLE' })
    })
    .then(user => {
      const tokenUser = signToken({ id: user._id, username: user.username, email: user.email })
      initialTokenUser = tokenUser
      return User.create({ username: 'admin', email: 'admin@gmail.com', password: 'Adminssd', role: 'admin' })
    })
    .then(userAdmin => {
      const tokenAdmin = signToken({ id: userAdmin._id, username: userAdmin.username, email: userAdmin.email })
      initialTokenAdmin = tokenAdmin;
      return History.create({ Puller: initialPullerId, TrashId: initialTrashId, height: 40, weight: 50 })
    })
    .then(history => {
      initialHistory = history._id
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
        return History.deleteMany({})
      })
      .then(_ => { console.log('successfully deleting'); done() })
      .catch(console.log)
  }
})

describe('Testing for History trashcan up', _ => {
  describe('POST /history/:id (trashId)', _ => {
    let link = '/history/';
    describe('success process create History', _ => {
      it('should send an object history with 201 status code', done => {
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('history', 'trash');
            expect(res.body.history).to.be.an('object').to.have.any.keys('_id', 'Puller', 'TrashId', 'height', 'weight');
            expect(res.body.history.height).to.be.a('number');
            expect(res.body.history.weight).to.be.a('number');
            expect(res.body.history._id).to.be.a('string');
            expect(res.body.history.TrashId).to.be.a('string');
            expect(res.body.history.Puller).to.be.a('string');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight');
            expect(res.body.trash._id).to.be.a('string');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('latitude', 'longitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.weight).to.equal(0);
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.height).to.equal(0);
            done()
          })
      })
    })
    describe('error process create History', _ => {
      it('should send an object (msg) with 403 status code because Do not have access', done => {
        chai
          .request(app)
          .post(link+initialTrashId)
          .set('token', initialTokenUser)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because Invalid Token', done => {
        chai  
          .request(app)
          .post(link+initialTrashId)
          .set('token', falseToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done();
          })
      })
      it('should send an object (msg) with 403 status code because missing token', done => {
        chai  
          .request(app)
          .post(link+initialTrashId)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
    })
  })

  describe('GET /history', _ => {
    let link = '/history'
    describe('success process for get all history', _ => {
      it('should send an object histories with 200 status code', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            console.log(res.body)
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('histories');
            expect(res.body.histories).to.be.an('array');
            expect(res.body.histories[0]).to.be.an('object').to.have.any.keys('_id', 'Puller', 'TrashId', 'height', 'weight');
            expect(res.body.histories[0]._id).to.be.a('string');
            expect(res.body.histories[0].Puller).to.be.an('object').to.have.any.keys('username', 'email');
            expect(res.body.histories[0].TrashId).to.be.an('object').to.have.any.keys('weight', 'height', 'location');
            expect(res.body.histories[0].Puller.username).to.be.a('string');
            expect(res.body.histories[0].Puller.email).to.be.a('string');
            expect(res.body.histories[0].TrashId.weight).to.be.a('number');
            expect(res.body.histories[0].TrashId.height).to.be.a('number');
            expect(res.body.histories[0].TrashId.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.histories[0].TrashId.location.longitude).to.be.a('string');
            expect(res.body.histories[0].TrashId.location.latitude).to.be.a('string');
            done()
          })
      })
    })
    describe('error process for get all history', _ => {
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .get(link)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because Invalid Token', done => {
        chai
          .request(app)
          .get(link)
          .set('token', falseToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done()
          })
      })
    })
  })

  describe('DELETE /history/:id', _ => {
    let link = '/history/';
    describe('success process delete a history', _ => {
      it('should send an object msg with 200 status code', done => {
        chai
          .request(app)
          .delete(link+initialHistory)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('success delete history');
            done()
          })
      })
    })
    describe('error process delete a history', _ => {
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .delete(link+initialHistory)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done();
          })
      })
      it('should send an object msg with 403 status code becuase Invalid Token', done => {
        chai
          .request(app)
          .delete(link+initialHistory)
          .set('token', falseToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done();
          })
      })
      it('should send an object msg with 403 status code because Do not have access', done => {
        chai
          .request(app)
          .delete(link+initialHistory)
          .set('token', initialTokenUser)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
      it('should send an object msg with 404 status code because invalid id', done => {
        let newLink = '/history/abcderf';
        chai
          .request(app)
          .delete(newLink)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Your search was not found');
            done();
          })
      })
    })
  })
})