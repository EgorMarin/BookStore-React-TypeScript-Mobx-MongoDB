const Joi = require('@hapi/joi');

const registerValidation = data => {
  const schema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    country: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    address: Joi.string().min(4).required(),
    postal: Joi.string().min(3).required(),
    isAdmin: Joi.bool().required()
  })
  return schema.validate(data)
}

const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
  })
  return schema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation