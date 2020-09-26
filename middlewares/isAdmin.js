const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    return next();
  }
  return res.json({error: "You aren't able to do it, you're not a seller!"})
}

module.exports = isAdmin