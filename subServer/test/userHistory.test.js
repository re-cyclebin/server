const chai = require('chai'),
  chaiHttp = require('chai-http'),
  { User, UserHistory } = require('../models'),
  { jwt } = require('../helpers'),
  app = require('../app'),
  { signToken } = jwt

chai.use(chaiHttp);
const ept = chai.expect;

let initialToken,
  initialTokenPull,
  initialHistoryId,
  initialTokenAdmin,
  initialTokenOther,
  initialHistoryIdNew,
  falseToken = 'dfewgwaegawegewa'


before(done => {
  User.create({ username: 'belum ada', password: 'masih belum adA', email: 'gwt@gmail.com' })
    .then(user => {
      let tokenfirst = signToken({ id: user._id })
      initialToken = tokenfirst
      return UserHistory.create({ UserId: user._id, point: 51 })
    })
    .then(historyUser => {
      initialHistoryId = historyUser._id
      return User.create({ username: 'lala', password: 'Ladsfsf', email: 'faeff@gmail.com', role: 'puller' })
    })
    .then(puller => {
      const tokenPull = signToken({ id: puller._id })
      initialTokenPull = tokenPull
      return User.create({ username: 'otherUser', password: 'OtherUser', email: 'other@gmail.com' })
    })
    .then(other => {
      const tokenOther = signToken({ id: other._id })
      initialTokenOther = tokenOther
      return User.create({ username: 'ffaewfewaf', email: 'fwefwef@gmail.com', password: 'fdafafdsF', role: 'admin' })
    })
    .then(admin => {
      const tokenAdmin = signToken({ id: admin._id })
      initialTokenAdmin = tokenAdmin;
      return UserHistory.create({ UserId: admin._id, point: 560 })
    })
    .then(newHistory => {
      initialHistoryIdNew = newHistory._id
      done()
    })
    .catch(console.log)
})

after(done => {
  if(process.env.NODE_ENV == 'testing'){ 
    User.deleteMany({})
      .then(_ => {
        console.log('testing history user success deleted');
        return UserHistory.deleteMany({})
      })
      .then(() => {
        console.log('testing userHistory user success deleted');
        done()
      })
      .catch(console.log)
  }
})

describe('env variable testing', _ => {
  it('should return right think', done => {
    ept(process.env.NODE_ENV).to.be.a('string');
    ept(process.env.NODE_ENV).to.equal('testing');
    ept(process.env.JWT_SECRET).to.be.a('string');
    ept(process.env.JWT_SECRET).to.equal('recyclebin_finalProject');
    ept(process.env.NODE_ENV).not.to.equal('development');
    done()
  })
})


describe('History user routes testing', _ => {
  
  describe('GET /hisuser geting all user for authentication', _ => {
    
    let link = '/hisuser';
    describe('success process when get al history of user authentication', _ => {
      it('should send an object (userHistory) with 200 status code', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialToken)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(200);
            ept(res.body).to.be.an('object').to.have.any.keys('UserHis');
            ept(res.body.UserHis).to.be.an('array');
            ept(res.body.UserHis[0]).to.be.an('object').to.have.any.keys('_id', 'UserId', 'createdAt', 'updatedAt');
            ept(res.body.UserHis[0].point).to.be.a('number');
            ept(res.body.UserHis[0].UserId).to.be.a('string');
            done()
          })
      })
    })
    describe('error process when get all history of user authentication', _ => {
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .get(link)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because invalid token', done=> {
        chai
          .request(app)
          .get(link)
          .set('token', falseToken)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Invalid Token');
            done();
          })
      })
      it('should send an object msg with 403 status code because Do not have access (pull)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenPull)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Do not have access (admin)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
    })

  })

  describe('DELETE /hisuser/:id delete history user', _ => {
    let link = '/hisuser'

    describe('success process delete history user', _ => {
      it('should send an object msg with 200 status code', done => {
        chai
          .request(app)
          .delete(link+`/${initialHistoryId}`)
          .set('token', initialToken)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(200);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('delete history success');
            done()
          })
      })
    })
    describe('error process delete history user', _ => {
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .delete(link+`/${initialHistoryId}`)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because do not have access', done => {
        chai
          .request(app)
          .delete(link+`/${initialHistoryId}`)
          .set('token', initialTokenPull)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Authorization Error', done => {
        chai
          .request(app)
          .delete(link+`/${initialHistoryIdNew}`)
          .set('token', initialTokenOther)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
    })

  })

  describe('GET /hisuser/admin getall global history for admin', _ => {
    let link = '/hisuser/admin';
    describe('success process admin get all data history', _ => {
      it('should send an object histories with 200 status code', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(200);
            ept(res.body).to.be.an('object').to.have.any.keys('userHistories');
            ept(res.body.userHistories).to.be.an('array')
            ept(res.body.userHistories[0]).to.be.an('object').to.have.any.keys('UserId', 'createdAt', 'point');
            ept(res.body.userHistories[0].point).to.be.a('number');
            done()
          })
      })
    })
    describe('error process when admin get all data history', _ => {
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .get(link)
          .end((err,res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because invalid token', done => {
        chai
          .request(app)
          .get(link)
          .set('token', falseToken)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Invalid Token');
            done()
          })
      })
      it('should send an object msg with 403 status code because do not have access (other)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenOther)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
      it('should send an object msg with 403 status code because do not have access (puller)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenPull)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
      it('should send an object msg with 403 status code because do not have access (user)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialToken)
          .end((err, res) => {
            ept(err).to.be.null;
            ept(res).to.have.status(403);
            ept(res.body).to.be.an('object').to.have.any.keys('msg');
            ept(res.body.msg).to.be.a('string');
            ept(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
    })
  })

})