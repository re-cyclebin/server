require('dotenv').config()

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

mongoose.connect(`mongodb+srv://ericsudhartio:${process.env.MONGO_PASS}@cluster0-o92dt.mongodb.net/${process.env.MONGODB_URL}?retryWrites=true&w=majority`, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })
  .then(a => console.log('MongoDb now connected', a.connections[0].name))
  .catch(console.log)

// mongoose.connect(`mongodb://localhost/re-cycle-${process.env.NODE_ENV}`, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })
//   .then(a => console.log('MongoDb now connected (local/testing)', a.connections[0].name))
//   .catch(console.log)

app.use('/', routes)

app.use(errorhandler)

app.listen(PORT, _ => console.log(`Listening on PORT ${PORT}`))

module.exports = app