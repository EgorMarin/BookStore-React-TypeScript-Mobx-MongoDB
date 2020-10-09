const {Schema, model, Types} = require('mongoose')

const productSchema = new Schema({
  name: {type: String, require: true},
  image: {type: String, required: true},
  author: {type: String, required: true},
  genre: {type: String, required: true},
  price: {type: Number, required: true},
  count: {type: Number, requred: true},
  rating: 
  [{
    userId: {type: String, required: true}, 
    rate: {type: Number, required: true}
  }],
  comments: 
  [{
    userId: {type: String, required: true},
    userName: {type: String, required: true}, 
    text: {type: String, required: true},
    dateTime: {type: Date, required: true}
  }],
  owner: 
  {
    ownerName: {type: String, required: true}, 
    ownerId: {type: Types.ObjectId, ref: 'User', required: true}
  },
  customers: [{type: Types.ObjectId, ref: 'User', required: true}]
})

module.exports = model('Product', productSchema)

