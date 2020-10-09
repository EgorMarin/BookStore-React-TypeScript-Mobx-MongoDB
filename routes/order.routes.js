const {Router} = require('express')
const router = Router()
const Order = require('../models/orderModel')
const auth = require('../middlewares/verifyToken')
const isAdmin = require('../middlewares/isAdmin')

router.get('/', auth, async (req, res) => {
  try {
    const {userId, isAdmin} = req.user
    if (isAdmin) {
      const orders = await Order.find({sellerId: userId})
        .populate('productId', 'owner name author image genre price')
        .populate('customerId', 'name country city address postal')
        .populate('sellerId', 'country city address postal')
        .exec()
      return res.json(orders)
    }

    const orders = await Order.find({customerId: userId})
      .populate('productId', 'owner name author image genre price')
      .populate('customerId', 'name country city address postal')
      .populate('sellerId', 'country city address postal')
      .exec()
    res.json(orders)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})


router.post('/status/:id', auth, isAdmin, async (req, res) => {
  try {
    const {userId} = req.user
    const {status} = req.body
    const order = await Order.findById(req.params.id)
    if (userId !== order.sellerId.toString()) return res.json({error: "It's not your order, you can't change it!"})
    order.status = status
    await order.save()
    const orders = await Order.find({sellerId: userId})
      .populate('productId', 'owner name author image genre price')
      .populate('customerId', 'name country city address postal')
      .populate('sellerId', 'country city address postal')
      .exec()
    res.json(orders)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

module.exports = router