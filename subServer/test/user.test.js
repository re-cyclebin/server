const chai = require('chai'),
  chaiHttp = require('chai-http'),
  app = require('../app'),
  { User, Trash } = require('../models'),
  { jwt } = require('../helpers'),
  { signToken } = jwt

chai.use(chaiHttp)
const expect = chai.expect;

let initialId,
  initialToken,
  initialUser,
  initialTrash,
  initialTokenAdmin,
  initialTokenPull,
  falsetoken = 'fewniwpfnafwamfksmkfnskflnaskfc2'

before(done => {
  const dummy = {
    username: 'ericsudhartio1',
    email: 'sudhartioeric@gmail.com',
    password: 'Finalproject'
  }
  User.create(dummy)
    .then(user => {
      initialUser = user
      initialId = user._id;
      const token = signToken({ id: user._id, username: user.username, password: user.password })
      initialToken = token
      return Trash.create({location: { longitude: 241, latitude: 414 }})
    })
    .then(trash => {
      initialTrash = trash;
      return User.create({ username: 'budi123', password: 'Budinfe', email: 'fewfewfew@gmail.com', role: 'puller' })
    })
    .then(pul => {
      initialTokenPull = signToken({ id: pul._id, username: pul.username, email: pul.email })
      return User.create({ username: 'admin123', password: 'asfsf12sdfS', email: 'fewfefw@gmail.com', role: 'admin' })
    })
    .then(admin => {
      initialTokenAdmin = signToken({ id: admin._id });
      done()
    })
    .catch(console.log)
})

after(done => {
  if(process.env.NODE_ENV == 'testing'){
    User.deleteMany({})
      .then(_ => { console.log('testing: delete data user successfully!'); done() })
      .catch(console.log)
  }
})

function updatePoint (num) {
  User.findByIdAndUpdate(initialId, { point: Number(num) }, {new:true})
    .then(user => { initialUser = user; console.log('success update') })
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

describe('Testing for User Routes', _ => {
  describe('POST /signup', _ => {
    let newUser = {
      username: 'akbarfitra',
      email: 'akbarfitra@gmail.com',
      password: 'akbarFitra'
    }
    let link = '/signup';
    describe('success process signup new User', _ => {
      it('should send an object (user) with 201 status code and role is user', done => {
        chai
          .request(app)
          .post(link)
          .send(newUser)
          .end((err,res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id','username','password', 'email', 'role', 'point', 'reward');
            expect(res.body.user.password).to.not.equal(newUser.password);
            expect(res.body.user.point).to.be.a('number');
            expect(res.body.user.point).to.equal(0);
            expect(res.body.user.reward).to.be.a('number');
            expect(res.body.user.reward).to.equal(0);
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('user');
            done();
          })
      })
      it('should send a object (user) with 201 status code and role is puller', done => {
        let userPull = {
          username: 'indra',
          password: 'Indraadit',
          email: 'indraadit@gmail.com',
          role: 'puller'
        }
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenAdmin)
          .send(userPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'password', 'email', 'role', 'point', 'reward');
            expect(res.body.user.password).to.not.equal(newUser.password);
            expect(res.body.user.point).to.be.a('number');
            expect(res.body.user.point).to.equal(0);
            expect(res.body.user.reward).to.be.a('number');
            expect(res.body.user.reward).to.equal(0);
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('puller');
            done()
          })
      })
      it('should send a object (user) with 201 status code and role is admin', done => {
        let userAdmin = {
          username: 'evan',
          password: 'Evanyouu',
          email: 'evanyou@gmail.com',
          role: 'admin'
        }
        chai
          .request(app)
          .post(link)
          .send(userAdmin)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'password', 'email', 'role', 'point', 'reward');
            expect(res.body.user.password).to.not.equal(newUser.password);
            expect(res.body.user.point).to.be.a('number');
            expect(res.body.user.point).to.equal(0);
            expect(res.body.user.reward).to.be.a('number');
            expect(res.body.user.reward).to.equal(0);
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('admin');
            done();
          })
      })
      it('should send an object (user) with 201 status code and role is user', done => {
        let newUser = { username: 'fsdfsdf', password: 'fsafawefewF', email: 'faewfewf@gmail.com' }
        chai
          .request(app)
          .post(link)
          .send(newUser)
          .set('token', initialTokenAdmin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'password', 'email', 'role', 'point', 'reward');
            expect(res.body.user.password).to.not.equal(newUser.password);
            expect(res.body.user.point).to.be.a('number');
            expect(res.body.user.point).to.equal(0);
            expect(res.body.user.reward).to.be.a('number');
            expect(res.body.user.reward).to.equal(0);
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('user');
            done();
          })
      })
    })
    describe('error process signup new User', _ => {
      it('should sned an object (msg, errors) with 400 status code because missing username', done => {
        const noUsername = { ...newUser };
        delete noUsername.username;
        chai
          .request(app)
          .post(link)
          .send(noUsername)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('username is required');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because missing email', done => {
        const noEmail = { ...newUser };
        delete noEmail.email;
        chai
          .request(app)
          .post(link)
          .send(noEmail)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('email is required');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because missing password', done => {
        const noPassword = { ...newUser };
        delete noPassword.password;
        chai
          .request(app)
          .post(link)
          .send(noPassword)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('password is required');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because duplicated Email', done => {
        const dupEmail = { ...newUser };
        dupEmail.email = 'sudhartioeric@gmail.com';
        chai
          .request(app)
          .post(link)
          .send(dupEmail)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('duplicate email detected');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because min char password', done => {
        const charPass = { ...newUser };
        charPass.password = 'sfa';
        chai
          .request(app)
          .post(link)
          .send(charPass)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('password min 5 char');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because no Capital case in password', done => {
        const noCapPass = { ...newUser };
        noCapPass.password = 'abcdfsfsfs';
        chai
          .request(app)
          .post(link)
          .send(noCapPass)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.errors).to.be.an('array').that.includes('password min 1 capital case');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            done()
          })
      })
      it('should send an object (msg, errors) with 400 status code because duplicate username', done => {
        const dupName = { ...newUser };
        dupName.email = 'aditya@gmail.com';
        chai
          .request(app)
          .post(link)
          .send(dupName)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg', 'errors');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Validation Error');
            expect(res.body.errors).to.be.an('array').that.includes('duplicate username detected');
            done()
          })
      })
      it('should send an object (msg) with status code 403 because do not have access', done => {
        let newUserPuller = { username: 'fdafaewff', password: 'Fdafwe', email: 'efkeae@gmail.com', role: 'puller' }
        chai
          .request(app)
          .post(link)
          .set('token', initialToken)
          .send(newUserPuller)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object (msg) with status code 403 because do not have access', done => {
        let newUserPuller = { username: 'fdafaewff', password: 'Fdafwe', email: 'efkeae@gmail.com', role: 'puller' }
        chai
          .request(app)
          .post(link)
          .set('token', initialTokenPull)
          .send(newUserPuller)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because do not have access', done => {
        let newUserPuller = { username: 'fwwefwfdsf', password: 'fwefewfF', email: 'fafawef@mgail.com', role: 'admin' }
        chai
          .request(app)
          .post(link)
          .set('token', initialToken)
          .send(newUserPuller)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('should send an object (msg) with 403 status code because missing token', done => {
        let newUserPuller = { username: 'faefwefwef', password: 'fdfweF', email: 'fewf@gmail.com', role: 'puller' }
        chai
          .request(app)
          .post(link)
          .send(newUserPuller)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Do not have access');
            done()
          })
      })
      it('snould send an object (msg) with 403 status code because invalid token', done => {
        let newUserPuller = { username: 'fdafsadfsadgasd', password: 'dfafsdF', email: 'dafef@gmail.com', role: 'puller' }
        chai
          .request(app)
          .post(link)
          .set('token', falsetoken)
          .send(newUserPuller)
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
  
  // ------------------------SIGN IN----------------------------
  describe('POST /signin', _ => {
    const userSignin = {
      request: 'ericsudhartio1',
      password: 'Finalproject'
    }
    let link = '/signin'
    describe('success process signin User', _ => {
      it('should send an object (user, token) with 200 status code, signIn with username', done => {
        chai
          .request(app)
          .post(link)
          .send(userSignin)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('user', 'token');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'password', 'email');
            expect(res.body.user.username).to.be.a('string');
            expect(res.body.user.email).to.be.a('string');
            expect(res.body.user.password).to.be.a('string');
            expect(res.body.user.password).to.not.equal(userSignin.password);
            expect(res.body.token).to.be.a('string');
            done()
          })
      })
      it('should send an object (user, token) with 200 status code, signIn with email', done => {
        let signInEmail ={ request: 'sudhartioeric@gmail.com', password: 'Finalproject' };
        chai
          .request(app)
          .post(link)
          .send(signInEmail)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('user', 'token');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'password', 'email');
            expect(res.body.user.username).to.be.a('string');
            expect(res.body.user.email).to.be.a('string');
            expect(res.body.user.password).to.be.a('string');
            expect(res.body.user.password).to.not.equal(signInEmail.password);
            expect(res.body.token).to.be.a('string');
            done()
          })
      })
    })
    describe('error process signin User', _ => {
      it('should send an object (msg) with 400 status code because missing request', done => {
        const noRequest = { ...userSignin };
        delete noRequest.request;
        chai
          .request(app)
          .post(link)
          .send(noRequest)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing request/password value');
            done()
          })
      })
      it('should send an object (msg) with 400 status code because missing password', done => {
        const nopass = { ...userSignin };
        delete nopass.password;
        chai
          .request(app)
          .post(link)
          .send(nopass)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('missing request/password value');
            done()
          })
      })
      it('should send an object (msg) with 400 status code because user request/password wrong', done => {
        const wrongInput = { request: 'aquax', password: 'xauqa' };
        chai
          .request(app)
          .post(link)
          .send(wrongInput)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('request/password wrong');
            done()
          })
      })
    })
  })

  // -----------------------CHECK SIGNIN USER-----------------------
  describe('GET /usersignin', _ => {
    let link = '/usersignin';
    describe('success process check userSignin', _ => {
      it('should send an object (user, token) with 200 status code', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'email');
            expect(res.body.user._id).to.be.a('string');
            expect(res.body.user.username).to.be.a('string');
            expect(res.body.user.email).to.be.a('string');
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('user');
            done()
          })
      })
      it('should send an object (user, token) with 200 status code (pull)', done => {
        chai
          .request(app)
          .get(link)
          .set('token', initialTokenPull)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object').to.have.any.keys('user');
            expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'email');
            expect(res.body.user._id).to.be.a('string');
            expect(res.body.user.username).to.be.a('string');
            expect(res.body.user.email).to.be.a('string');
            expect(res.body.user.role).to.be.a('string');
            expect(res.body.user.role).to.equal('puller');
            done()
          })
      })
    })
    it('should send an object (user, token) with 200 status code admin', done => {
      chai
        .request(app)
        .get(link)
        .set('token', initialTokenAdmin)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').to.have.any.keys('user');
          expect(res.body.user).to.be.an('object').to.have.any.keys('_id', 'username', 'email');
          expect(res.body.user._id).to.be.a('string');
          expect(res.body.user.username).to.be.a('string');
          expect(res.body.user.email).to.be.a('string');
          expect(res.body.user.role).to.be.a('string');
          expect(res.body.user.role).to.equal('admin');
          done()
        })
    })
    describe('error process check userSignin', _ => {
      it('should send an object msg with 403 status code because missing Token', done => {
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
          .set('token', falsetoken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body).to.be.an('object').to.have.any.keys('msg');
            expect(res.body.msg).to.be.a('string');
            expect(res.body.msg).to.equal('Invalid Token');
            done()
          })
      })
      it('should send an object msg with 404 status code because bad request link', done => {
        chai
          .request(app)
          .get('/signinfwe')
          .set('token', initialToken)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object')
            done()
          })
      })
    })
  })

  // -------------------------GET REWARD---------------------
  /*
    POINT -> REWARD
    10000 -> 5000
    20000 -> 12000
    30000 -> 18000
    50000 -> 30000
    100000 -> 80000
  */
 describe('PATCH /reward', _ => {
   let link = '/reward'
   describe('success process reward', _ => {
     it('should send an object user with 200 status code, change reward 5000', done => {
      updatePoint(12000)
      let chooseReward = { getReward: 5000 }
      chai
        .request(app)
        .patch(link)
        .set('token', initialToken)
        .send(chooseReward)
        .end((err, res) => {
          console.log(res.body)
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').to.have.any.keys('user');
          expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward');
          expect(res.body.user.username).to.be.a('string');
          expect(res.body.user.point).to.be.a('number');
          expect(res.body.user.point).to.equal(initialUser.point - 10000);
          expect(res.body.user.reward).to.be.a('number');
          expect(res.body.user.reward).to.equal(initialUser.reward + chooseReward.getReward);
          done()
        })
     })
     it('should send an object user with 200 status code, change reward 12000', done => {
       updatePoint(21000)
       let chooseReward = { getReward: 12000 };
       chai
        .request(app)
        .patch(link)
        .set('token', initialToken)
        .send(chooseReward)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').to.have.any.keys('user');
          expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward');
          expect(res.body.user.username).to.be.a('string');
          expect(res.body.user.point).to.be.a('number');
          expect(res.body.user.point).to.equal(initialUser.point - 20000);
          expect(res.body.user.reward).to.be.a('number');
          expect(res.body.user.reward).to.equal(initialUser.reward + chooseReward.getReward);
          done()
        })
     })
     it('should send an object user with 200 status code, change reward 18000', done => {
       updatePoint(35000);
       let chooseReward = { getReward: 18000 };
       chai
        .request(app)
        .patch(link)
        .set('token', initialToken)
        .send(chooseReward)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').to.have.any.keys('user');
          expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward');
          expect(res.body.user.username).to.be.a('string');
          expect(res.body.user.point).to.be.a('number');
          expect(res.body.user.point).to.equal(initialUser.point - 30000);
          expect(res.body.user.reward).to.be.a('number');
          expect(res.body.user.reward).to.equal(initialUser.reward + chooseReward.getReward);
          done()
        })
     })
     it('should send an object user with 200 status code, change reward 30000', done => {
      updatePoint(52000)
      let chooseReward = { getReward: 30000 };
      chai
       .request(app)
       .patch(link)
       .set('token', initialToken)
       .send(chooseReward)
       .end((err, res) => {
         expect(err).to.be.null;
         expect(res).to.have.status(200);
         expect(res.body).to.be.an('object').to.have.any.keys('user');
         expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward');
         expect(res.body.user.username).to.be.a('string');
         expect(res.body.user.point).to.be.a('number');
         expect(res.body.user.point).to.equal(initialUser.point - 50000);
         expect(res.body.user.reward).to.be.a('number');
         expect(res.body.user.reward).to.equal(initialUser.reward + chooseReward.getReward);
         done()
       })
    })
    it('should send an object user with 200 status code, change reward 80000', done => {
      updatePoint(120000)
      let chooseReward = { getReward: 80000 };
      chai
       .request(app)
       .patch(link)
       .set('token', initialToken)
       .send(chooseReward)
       .end((err, res) => {
         expect(err).to.be.null;
         expect(res).to.have.status(200);
         expect(res.body).to.be.an('object').to.have.any.keys('user');
         expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward');
         expect(res.body.user.username).to.be.a('string');
         expect(res.body.user.point).to.be.a('number');
         expect(res.body.user.point).to.equal(initialUser.point - 100000);
         expect(res.body.user.reward).to.be.a('number');
         expect(res.body.user.reward).to.equal(initialUser.reward + chooseReward.getReward);
         done()
       })
    })
    it('should send an object msg with 200 status code because change reward > point', done => {
      updatePoint(10000)
      let chooseReward = { getReward: 12000 }
      chai
        .request(app)
        .patch(link)
        .set('token', initialToken)
        .send(chooseReward)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').to.have.any.keys('user');
          expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'point', 'reward')
          expect(res.body.user.point).to.be.a('number');
          expect(res.body.user.point).to.equal(initialUser.point)
          done()
        })
    })
  })
  describe('error process getReward', _ => {
    it('should send an object msg with 400 status code because point', done => {
      updatePoint(0);
      let chooseReward = { getReward: 30000 };
      chai
        .request(app)
        .patch(link)
        .set('token', initialToken)
        .send(chooseReward)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('object').to.have.any.keys('msg');
          expect(res.body.msg).to.be.a('string');
          expect(res.body.msg).to.equal('the point are not enough');
          done()
        })
    })
    it('should send an object msg with 403 status code because missing token', done => {
      updatePoint(50000)
      let chooseReward = { getReward: 18000 };
      chai
        .request(app)
        .patch(link)
        .send(chooseReward)
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
      updatePoint(50000)
      let chooseReward = { getReward: 18000 };
      chai
        .request(app)
        .patch(link)
        .set('token', falsetoken)
        .send(chooseReward)
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
 describe('PATCH /getpoint/:id point', _ => {
   let link = '/getpoint';
   const newPoint = { point: 10 };
   describe('success process user get point', _ => {
     it('should send an object user with 200 status code', done => {
       chai
         .request(app)
         .patch(link)
         .set('token', initialToken)
         .send(newPoint)
         .end((err, res) => {
           expect(err).to.be.null;
           expect(res).to.have.status(200);
           expect(res.body).to.be.an('object').to.have.any.keys('user', 'UserHis');
           expect(res.body.UserHis).to.be.an('object').to.have.any.keys('point', 'UserId');
           expect(res.body.UserHis.point).to.be.a('number');
           expect(res.body.UserHis.UserId).to.be.a('string');
           expect(res.body.UserHis.UserId).to.equal(res.body.user._id);
           expect(res.body.user).to.be.an('object').to.have.any.keys('username', 'email', 'point');
           expect(res.body.user.username).to.be.a('string');
           expect(res.body.user.email).to.be.a('string');
           expect(res.body.user.point).to.be.a('number');
           expect(res.body.user.point).to.equal(Number(initialUser.point) + Number(newPoint.point));
           done()
         })
     })
   })
   describe('error process when user get a point', _ => {
     it('should send an object msg with 500 status code because wrong type', done => {
       const wrongType = { point: '12n' }
       chai
         .request(app)
         .patch(link)
         .set('token', initialToken)
         .send(wrongType)
         .end((err, res) => {
           expect(err).to.be.null;
           expect(res).to.have.status(500);
           expect(res.body).to.be.an('object').to.have.any.keys('msg');
           expect(res.body.msg).to.be.a('string');
           expect(res.body.msg).to.equal('Internal Server Error');
           done()
         })
     })
     it('should send an object msg with 403 status code because missing token', done => {
       chai
         .request(app)
         .patch(link)
         .send(newPoint)
         .end((err, res) => {
           expect(err).to.be.null;
           expect(res).to.have.status(403);
           expect(res.body).to.be.an('object').to.have.any.keys('msg');
           expect(res.body.msg).to.be.a('string');
           expect(res.body.msg).to.equal('Authentication Error');
           done()
         })
     })
     it('should send an object msg with 403 status code because invalid token', done => {
       chai
         .request(app)
         .patch(link)
         .send(newPoint)
         .set('token', falsetoken)
         .end((err, res) => {
           expect(err).to.be.null;
           expect(res).to.have.status(403);
           expect(res.body).to.be.an('object').to.have.any.keys('msg');
           expect(res.body.msg).to.be.a('string');
           expect(res.body.msg).to.equal('Invalid Token');
           done()
         })
     })
     it('should send an object msg with 403 status code because Do not have access', done => {
       chai
         .request(app)
         .patch(link)
         .send(newPoint)
         .set('token', initialTokenPull)
         .end((err, res) => {
           expect(err).to.be.null;
           expect(res).to.have.status(403);
           expect(res.body).to.be.an('object').to.have.any.keys('msg')
           expect(res.body.msg).to.be.a('string');
           expect(res.body.msg).to.equal('Do not have access');
           done();
         })
     })
   })
 })
})