const {Schema, model, Types} = require('mongoose')

const orderModel = new Schema({
  productId: {type: Types.ObjectId, ref: 'Product', required: true},
  count: {type: Number, required: true},
  customerId: {type: Types.ObjectId, ref: 'User', required: true},
  sellerId: {type: Types.ObjectId, ref: 'User', required: true},
  status: {type: String, required: true}
})

module.exports = model('Order', orderModel)