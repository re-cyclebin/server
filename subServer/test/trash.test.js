const chai = require('chai'),
  chaiHttp = require('chai-http'),
  app = require('../app'),
  { Trash, User } = require('../models'),
  { jwt } = require('../helpers'),
  { signToken } = jwt

chai.use(chaiHttp);
const expect = chai.expect;

let initialTokenAdmin='',
  initialToken='',
  initialTokenPull='',
  initialTrash='',
  falseToken = 'fdsafewfupf2jd2idwds'

before(done => {
  const dummyUserAdmin = { username: 'ericsudhartio', email: 'sudhartioeric123@gmail.com', password: 'FinalProject', role: 'admin' }
  User.create(dummyUserAdmin)
    .then(userAdmin => {
      const tokenAdmin = signToken({ id: userAdmin._id, username: userAdmin.username, password: userAdmin.password, email: userAdmin.email })
      initialTokenAdmin = tokenAdmin;
      const location = { longitude: 10, latitude: 103 };
      return Trash.create({ location })
    })
    .then(trash => {
      initialTrash = trash;
      const dummyUser = { username: 'sudhartioeric', email: 'ericsudhartio1233@gmail.com', password: 'Ericsudhartio' }
      return User.create(dummyUser)
    })
    .then(user => {
      const token = signToken({ id: user._id, username: user.username, password: user.password, email: user.email })
      initialToken = token;
      const dummyUserPull = { username: 'pulleruser', email: 'pullerUser@gmail.com', password: 'PullerIsreal', role: 'puller' }
      return User.create(dummyUserPull)
    })
    .then(userPuller => {
      const tokenPull = signToken({ id: userPuller._id, username: userPuller.username, email: userPuller.email })
      initialTokenPull = tokenPull;
      done()
    })
    .catch(console.log)
})

after(done => {
  if(process.env.NODE_ENV == 'testing'){
    User.deleteMany({})
      .then(_ => {
        console.log('testing: delete data user successfully!');
        return Trash.deleteMany({})
      })
      .then(_ => {
        console.log('testing: delete data trash successfully!');
        done()
      })
      .catch(console.log)
  }
}) 

describe('Testing for Trash Can Routes', _ => {
  describe('POST /trashcan/admin', _ => {
    let newTrash = {
      longitude: '2002',
      latitude: '210'
    }
    let link = '/trashcan/admin'
    describe('success process create new Trash', _ => {
      it('should send an object (trash) with 201 status code', done => {
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenAdmin)
          .send(newTrash)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'avaible');
            expect(res.body.trash._id).to.be.a('string');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.avaible).to.be.an('boolean');
            done()
          })
      })
    })
    describe('error process create new Trash', _ => {
      it('should send an object (msg, errors) with 400 status code because missing longitude', done => {
        const noLongitude = { ...newTrash };
        delete noLongitude.longitude;
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenAdmin)
          .send(noLongitude)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            expect(res.body.errors).to.be.an('array').that.includes('longitude is required');
            done();
          })
      })
      it('should send an object (msg, errores) with 400 status code because missing latitude', done => {
        const noLatitude = { ...newTrash };
        delete noLatitude.latitude;
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenAdmin)
          .send(noLatitude)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            expect(res.body.errors).to.be.an('array').that.includes('latitude is required');
            done();
          })
      })
      it('should send an object msg with 403 status code because autorization error', done => {
        chai
          .request(app)
          .post(link)
          .set('token', initialToken)
          .send(newTrash)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .post(link)
          .send(newTrash)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done();
          })
      })
      it('should send an object msg with 403 status code because jwt malformed', done => {
        chai
          .request(app)
          .post(link)
          .set('token', falseToken)
          .send(newTrash)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed')
            done();
          })
      })
    })
  })
  describe('GET /trashcan', _ => {
    let link = '/trashcan';
    describe('success process get all data trashcan', _ => {
      it('should send an object (trash) with 200 status code', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trasher');
            expect(res.body.trasher[0]).to.be.an('object').to.have.any.keys('location', 'height', 'wieght', 'avaible');
            expect(res.body.trasher[0].location).to.be.an('object').to.have.any.keys('longitude', 'latitude')
            expect(res.body.trasher[0].location.longitude).to.be.a('string');
            expect(res.body.trasher[0].location.latitude).to.be.a('string');
            expect(res.body.trasher[0].height).to.be.a('number');
            expect(res.body.trasher[0].weight).to.be.a('number');
            expect(res.body.trasher[0].avaible).to.be.an('boolean');
            done()
          })
      })
    })

    describe('error process get All data trascan', _ => {
      it('should send an object msg with 403 status code because jwt malformed', done => {
        chai
          .request(app)
          .get(link)
          .set('token', falseToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed');
            done();
          })
      })
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
    })
  })
  describe('PATCH /trashcan/pull/:id (puller update)', _ => {
    const update = { height: 50, weight: 40 }
    link = `/trashcan/pull`
    describe('success process patch trashcan', _ => {
      it('should send an object trash with 200 status code', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenPull)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'weight', 'height', 'avaible');
            expect(res.body.trash.avaible).to.be.an('boolean');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('latitude', 'longitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash._id).to.be.a('string');
            done()
          })
      })
    })
    describe('error process patch trascan', _ => {
      it('should send an object msg with 400 status code because missing height', done => {
        const noHeight = { ...update };
        delete noHeight.height;
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenPull)
          .send(noHeight)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing height/weight value');
            done()
          })
      })
      it('should send an object msg with 400 status code because missing weight', done => {
        const noWeight = { ...update };
        delete noWeight.weight;
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenPull)
          .send(noWeight)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing height/weight value');
            done()
          })
      })
      it('should send an object msg with 403 status code because authorization error', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because jwt malformed', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', falseToken)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed');
            done();
          })
      })
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 404 status code because invalid trashcan id', done => {
        let falseLink = `/trashcan/pull/jeiofewjfiqwifjq12`;
        chai
          .request(app)
          .patch(falseLink)
          .set('token', initialTokenPull)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('searching not found')
            done()
          })
      })
    })
  })

  describe('PATCH /trashcan/admin/:id', _ => {
    const newLocation = {
      location: {
        latitude: 1200,
        longitude: 1500
      }
    }
    let link = `/trashcan/admin`
    describe('success process change location trashcan', _ => {
      it('should send an object trash with 200 status code', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenAdmin)
          .send(newLocation)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'avaible');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash._id).to.be.a('string');
            done()
          })
      })
    })
    describe('error process change location trashcan', _ => {
      it('should send an object msg with 400 status code becuase missing latitude', done => {
        const missLatitude = { ...newLocation };
        delete missLatitude.location.latitude;
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenAdmin)
          .send(missLatitude)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing longitude/latitude');
            done()
          })
      })
      it('should send an object msg with 400 status code because missing longitude', done => {
        const missLongitude = { ...newLocation };
        delete missLongitude.location.longitude;
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenAdmin)
          .send(missLongitude)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing longitude/latitude');
            done();
          })
      })
      it('should send an object msg with 403 status code because authorization error', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .send(newLocation)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because jwt malformed', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', falseToken)
          .send(newLocation)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed');
            done();
          })
      })
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .send(newLocation)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 404 status code because invalid trashcan id', done => {
        let falseLink = `/trashcan/admin/jeiofewjfiqwifjq12`;
        let newloc = { location: { longitude: '400', latitude: '500' } }
        chai
          .request(app)
          .patch(falseLink)
          .set('token', initialTokenAdmin)
          .send(newloc)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('searching not found')
            done()
          })
      })
    })
  })

  describe('DELETE /trashcan/admin/:id', _ => {
    let link = `/trashcan/admin`;
    describe('success process deleting trash can by admin', _ => {
      it('should send an object msg with 200 status code', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).not.to.be.a('number');
            expect(res.body.msg).to.equal('trashcan successfully deleted');
            done()
          })
      })
    })
    describe('error process deleting trashcan', _ => {
      it('should send an object msg with 403 status code because authorization error', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authorization Error');
            done()
          })
      })
      it('should send an object msg with 403 status code because jwt malformed', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .set('token', falseToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('jwt malformed');
            done();
          })
      })
      it('should send an object msg with 403 status code because missing token', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object msg with 404 status code because invalid trashcan id', done => {
        let falseLink = `/trashcan/admin/jeiofewjfiqwifjq12`;
        chai
          .request(app)
          .delete(falseLink)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('searching not found')
            done()
          })
      })
    })
  })
})