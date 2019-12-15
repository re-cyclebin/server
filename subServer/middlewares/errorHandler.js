module.exports = (err, req, res, next) => {
  const status = err.status || 500
  const msg = err.msg || 'Internal Server Error'

  if(err.name === 'ValidationError') {
    const errors = []
    for(key in err.errors) {
      errors.push(err.errors[key].message)
    }
    res.status(400).json({
      msg: 'Validation Error',
      errors
    })
  } else if(err.name == 'JsonWebTokenError') {
    res.status(403).json({ msg: 'Invalid Token' })
  } else if(err.kind == 'ObjectId') {
    res.status(404).json({ msg: 'Your search was not found'})
  }
  else {
    res.status(status).json({ msg })
  }
}