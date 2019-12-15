// if(process.env.NODE_ENV == 'development') require('dotenv').config();
var MONGO = ''
if(process.env.NODE_ENV == 'development') {
  require('dotenv').config()
  MONGO = process.env.MONGODB_URL;
}else if( process.env.NODE_ENV == 'testing') {
  require('dotenv').config();
  MONGO = process.env.MONGODB_TESTING
}

const express = require('express'),
  cors = require('cors'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  PORT = process.env.PORT || 3000,
  app = express(),
  routes = require('./routes'),
  { errorhandler } = require('./middlewares')

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(`mongodb://localhost/${MONGO}`, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })
.then(_ => console.log('MongoDb now connected'))
.catch(console.log)

app.use('/', routes)
app.use(errorhandler)

app.listen(PORT, _ => console.log(`Listening on PORT ${PORT}`))

module.exports = app