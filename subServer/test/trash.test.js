const chai = require('chai'),
  chaiHttp = require('chai-http'),
  app = require('../app'),
  { Trash, User } = require('../models'),
  { jwt } = require('../helpers'),
  { redis } = require('../cache'),
  { signToken } = jwt

chai.use(chaiHttp);
const expect = chai.expect;

let initialTokenAdmin='',
  initialToken='',
  initialUser = '',
  initialTokenPull='',
  initialTrash='',
  initialTrash2 = '',
  falseToken = 'fdsafewfupf2jd2idwds',
  initialTrashUpdated = ''

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
      initialUser = user;
      const token = signToken({ id: user._id, username: user.username, password: user.password, email: user.email })
      initialToken = token;
      const dummyUserPull = { username: 'pulleruser', email: 'pullerUser@gmail.com', password: 'PullerIsreal', role: 'puller' }
      return User.create(dummyUserPull)
    })
    .then(userPuller => {
      const tokenPull = signToken({ id: userPuller._id, username: userPuller.username, email: userPuller.email })
      initialTokenPull = tokenPull;
      return Trash.create({ location : { longitude: 20, latitude: 50 } })
      done()
    })
    .then(trash2 => {
      initialTrash2 = trash2;
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

function updateTrashID (id) {
  Trash.findByIdAndUpdate(id, { status: true }, {new:true})
    .then(trash => {
      initialTrashUpdated = trash;
    })
    .catch(console.log)
}

describe('env variable testing', _ => {
  it('should return right think', done => {
    expect(process.env.NODE_ENV).to.be.a('string');
    expect(process.env.NODE_ENV).to.equal('testing');
    expect(process.env.JWT_SECRET).to.be.a('string');
    expect(process.env.JWT_SECRET).to.equal('recyclebin_finalProject');
    expect(process.env.NODE_ENV).not.to.equal('development');
    done()
  })
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
            expect(res.body.trash.height).to.equal(0);
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
      it('should send an object msg with 403 status code because do not have access ( user )', done => {
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
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because do not have access ( puller )', done => {
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenPull)
          .send(newTrash)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
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
      it('should send an object msg with 403 status code because Invalid Token', done => {
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
            expect(res.body.msg).to.equal('Invalid Token')
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
            expect(res.body.trasher[0]).to.be.an('object').to.have.any.keys('location', 'height', 'wieght', 'avaible', 'status');
            expect(res.body.trasher[0].location).to.be.an('object').to.have.any.keys('longitude', 'latitude')
            expect(res.body.trasher[0].location.longitude).to.be.a('string');
            expect(res.body.trasher[0].location.latitude).to.be.a('string');
            expect(res.body.trasher[0].height).to.be.a('number');
            expect(res.body.trasher[0].weight).to.be.a('number');
            expect(res.body.trasher[0].avaible).to.be.an('boolean');
            expect(res.body.trasher[0].status).to.be.an('boolean');
            done()
          })
      })
      it('should send an object msg with 200 status code ( puller )', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trasher');
            expect(res.body.trasher[0]).to.be.an('object').to.have.any.keys('location', 'height', 'wieght', 'avaible', 'status');
            expect(res.body.trasher[0].location).to.be.an('object').to.have.any.keys('longitude', 'latitude')
            expect(res.body.trasher[0].location.longitude).to.be.a('string');
            expect(res.body.trasher[0].location.latitude).to.be.a('string');
            expect(res.body.trasher[0].height).to.be.a('number');
            expect(res.body.trasher[0].weight).to.be.a('number');
            expect(res.body.trasher[0].avaible).to.be.an('boolean');
            expect(res.body.trasher[0].status).to.be.an('boolean');
            done()
          })
      })
      it('should send an object msg with 200 status code ( admin )', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trasher');
            expect(res.body.trasher[0]).to.be.an('object').to.have.any.keys('location', 'height', 'wieght', 'avaible', 'status');
            expect(res.body.trasher[0].location).to.be.an('object').to.have.any.keys('longitude', 'latitude')
            expect(res.body.trasher[0].location.longitude).to.be.a('string');
            expect(res.body.trasher[0].location.latitude).to.be.a('string');
            expect(res.body.trasher[0].height).to.be.a('number');
            expect(res.body.trasher[0].weight).to.be.a('number');
            expect(res.body.trasher[0].avaible).to.be.an('boolean');
            expect(res.body.trasher[0].status).to.be.an('boolean');
            done()
          })
      })
    })

    describe('error process get All data trascan', _ => {
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
  describe('POST /trashcan/push/:id (IOT update)', _ => {
    const update = { height: 50.2, weight: 40 }
    link = `/trashcan/push`
    describe('success process post trashcan', _ => {
      it('should send an object trash with 200 status code', done => {
        chai
          .request(app)
          .post(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'weight', 'height', 'avaible','status');
            expect(res.body.trash.avaible).to.be.an('boolean');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.height).to.equal(40-Number(update.height));
            expect(res.body.trash.weight).to.equal(update.weight * 100);
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('latitude', 'longitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.status).to.be.a('boolean');
            expect(res.body.trash._id).to.be.a('string');
            done()
          })
      })
      it('should send an object with 200 status code when max height', done => {
        let newUpdate = { height: 5, weight: 100 }
        chai
          .request(app)
          .post(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .send(newUpdate)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash')
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'height', 'weight', 'avaible', 'status');
            expect(res.body.trash._id) .to.be.a('string');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.avaible).to.be.a('boolean');
            expect(res.body.trash.avaible).not.to.equal(initialTrash.avaible);
            expect(res.body.trash.status).to.be.a('boolean');
            done()
          })
      })
    })
    describe('error process post trascan', _ => {
      it('should send an object msg with 400 status code because missing height', done => {
        const noHeight = { ...update };
        delete noHeight.height;
        chai
          .request(app)
          .post(link+`/${initialTrash._id}`)
          .set('token', initialToken)
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
          .post(link+`/${initialTrash._id}`)
          .set('token', initialToken)
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
      it('should send an object msg with 404 status code because invalid trashcan id', done => {
        let falseLink = `/trashcan/push/jeiofewjfiqwifjq12`;
        chai
          .request(app)
          .post(falseLink)
          .set('token', initialToken)
          .send(update)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Your search was not found')
            done()
          })
      })
    })
  })

  describe('PATCH /trashcan/admin/:id', _ => {
    const newLocation = {
      latitude: 1200.8,
      longitude: 1500
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
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'avaible', 'status');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.location.longitude).not.to.equal(initialTrash.location.longitude);
            expect(res.body.trash.location.latitude).not.to.equal(initialTrash.location.latitude);
            expect(res.body.trash.status).to.be.an('boolean');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash._id).to.be.a('string');
            done()
          })
      })
      it('should send an object trash with 200 status code', done => {
        let newLocations = { latitude: 8.212, longitude: 1212.31}
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenAdmin)
          .send(newLocations)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'avaible', 'status');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.location.longitude).not.to.equal(initialTrash.location.longitude);
            expect(res.body.trash.location.latitude).not.to.equal(initialTrash.location.latitude);
            expect(res.body.trash.status).to.be.an('boolean');
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
        delete missLatitude.latitude;
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
        delete missLongitude.longitude;
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
      it('should send an object msg with 403 status code because Do not have access (user)', done => {
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
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Do not have access (puller)', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash._id}`)
          .set('token', initialTokenPull)
          .send(newLocation)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Invalid Token', done => {
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
            expect(res.body.msg).to.equal('Invalid Token');
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
        let newloc = { longitude: '400', latitude: '500' }
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
            expect(res.body.msg).to.equal('Your search was not found')
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
      it('should send an object msg with 403 status code because Do not have access (user)', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Do not have access (puller)', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object msg with 403 status code because Invalid Token', done => {
        chai
          .request(app)
          .delete(link+`/${initialTrash._id}`)
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
            expect(res.body.msg).to.equal('Your search was not found')
            done()
          })
      })
    })
  })

  describe('PATCH /trashcan/status/:id', _ => {
    let link = '/trashcan/status'
    describe('success process update status when user request', _ => {
      it('should send an object (msg, trash) with 200 status code', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'trash');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('update success');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('height', 'weight', 'status');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.status).to.be.an('boolean');
            expect(res.body.trash.status).not.to.equal(initialTrash.status);
            done()
          })
      })
      it('should send an object ( msg, trash ) with 200 status code', done => {
        updateTrashID(initialTrash2._id)
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'trash');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('update success');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('height', 'weight', 'status');
            expect(res.body.trash.height).to.be.a('number');
            expect(res.body.trash.weight).to.be.a('number');
            expect(res.body.trash.status).to.be.an('boolean');
            expect(res.body.trash.status).not.to.equal(initialTrashUpdated.status);
            done()
          })
      })
    })
    describe('error process update status when user request', _ => {
      it('should send an object (msg) with 403 status code because invalid token', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .set('token', falseToken)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because missing token', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Authentication Error');
            done()
          })
      })
      it('should send an object (msg) with 404 status code because invalid id', done => {
        let falseLink = '/trashcan/status/dafsafdafs'
        chai
          .request(app)
          .patch(falseLink)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Your search was not found');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because Do not have access (puller)', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
      it('should send an object (msg) with 403 status code because Do not have access (admin)', done => {
        chai
          .request(app)
          .patch(link+`/${initialTrash2._id}`)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done();
          })
      })
    })
  })

  describe('GET /trashcan/iotstatus/:id IOT get iotstatus', _ => {
    let link = '/trashcan/iotstatus';
    describe('success process getting status', _ => {
      it('should send an object status with 200 status code no redis', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('boolean');
            expect(res.body).to.equal(initialTrash2.status)
            done()
          })
      })
    })
    describe('error process when getting status', _ => {
      it('should send an object msg 404 status code because invalid id', done => {
        chai
          .request(app)
          .get(link+'/3f3kfqdfwelfw')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Your search was not found');
            done()
          })
      })
    })
  })

  describe('GET /trashcan/:id get one id of trash', _ => {
    let link = '/trashcan';
    describe('success process when getting trash', _ => {
      it('should send an object trash with 200 status code (user)', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'status');
            expect(res.body.trash.status).to.be.a('boolean');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.weight).to.be.a('number');
            done()
          })
      })
      it('should send an object trash with 200 status code (admin)', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'status');
            expect(res.body.trash.status).to.be.a('boolean');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.weight).to.be.a('number');
            done()
          })
      })
      it('should send an object trash with 200 status code (puller)', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('trash');
            expect(res.body.trash).to.be.an('object').to.have.any.keys('_id', 'location', 'height', 'weight', 'status');
            expect(res.body.trash.status).to.be.a('boolean');
            expect(res.body.trash.location).to.be.an('object').to.have.any.keys('longitude', 'latitude');
            expect(res.body.trash.location.longitude).to.be.a('string');
            expect(res.body.trash.location.latitude).to.be.a('string');
            expect(res.body.trash.weight).to.be.a('number');
            done()
          })
      })
    })
    describe('error process when getting one Trash by Id', _ => {
      it('should send an object msg 404 status code because invalid id', done => {
        chai
          .request(app)
          .get(link+'/3f3kfqdfwelfw')
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Your search was not found');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because invalid token', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .set('token', falseToken)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because missing token', done => {
        chai
          .request(app)
          .get(link+`/${initialTrash2._id}`)
          .end((err,res) => {
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

})