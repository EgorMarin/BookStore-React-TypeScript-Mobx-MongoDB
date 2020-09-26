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
        .populate('productId', 'name author genre price')
        .populate('customerId', 'name email country city address postal')
        .exec()
      return res.json(orders)
    }
    // for customer
    const orders = await Order.find({customerId: userId})
      .populate('productId', 'owner name author image genre price')
      .populate('customerId', 'country city address postal')
      .exec()
    res.json(orders)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const {isAdmin} = req.user
    if (isAdmin) {
      const order = await Order.findById(req.params.id)
        .populate('productId', 'name author genre price')
        .populate('customerId', 'name email country city address postal')
        .exec()
      return res.json(order)
    }

    const order = await Order.findById(id)
      .populate('productId', 'owner name author genre price')
      .populate('customerId', 'country city address postal')
      .exec()
    res.json(order)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/status/:id', auth, isAdmin, async(req, res) => {
  try {
    const {status} = req.body
    const order = await Order.findById(req.params.id)
    if (req.user.userId !== order.sellerId.toString()) return res.json({error: "It's not your order!"})
    if (status) order.status = status
    await order.save()
    res.json("You've changed the order's status")
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

module.exports = router