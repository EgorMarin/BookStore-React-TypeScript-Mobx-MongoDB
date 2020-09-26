const {Schema, model, Types} = require('mongoose')

const userSchema = new Schema({
  email: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  password: {type: String, required: true},
  country: {type: String, required: true},
  city: {type: String, required: true},
  address: {type: String, required: true},
  postal: {type: String, required: true},
  cart: [
    {product: {type: Types.ObjectId, ref: 'Product', required: true}, count: {type: Number, required: true, default: 1}}
  ],
  products: [{product: {type: Types.ObjectId, ref: 'Product', required: true}}], 
  isAdmin: {type: Boolean, required: true, default: false}
})

module.exports = model('User', userSchema)
