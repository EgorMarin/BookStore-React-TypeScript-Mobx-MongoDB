const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.header('authtoken')
  if (!token) return res.json({error: "You're not authorized. Please sign in"})
  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY)
    req.user = verified
    next()
  } catch (err) {
    res.json({error: `${err}`})
  }
}

module.exports = auth