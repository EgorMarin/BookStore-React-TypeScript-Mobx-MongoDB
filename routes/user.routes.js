const {Router} = require('express')
const router = Router()
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const {registerValidation, loginValidation} = require('../middlewares/validation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middlewares/verifyToken')

router.post('/register', async (req, res) => {
  try {
    const {error} = registerValidation(req.body)
    if (error) return res.json({error: error.details[0].message})
    const {name, email, password, country, city, address, postal, isAdmin} = req.body
    const existed = await User.findOne({email})
    if (existed) return res.json({error: 'Email is already existed'}) 
    const hashPassword = await bcrypt.hash(password, 10)
    if (isAdmin) {
      const newUser = await new User({name, email, password: hashPassword, country, city, address, postal, isAdmin})
      await newUser.save()
      return res.json({success: "You've successfuly registered as seller"})
    }
    const newUser = await new User({name, email, password: hashPassword, country, city, address, postal})
    await newUser.save()
    res.json({success: "You've successfuly registered as customer"})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  } 
})

router.post('/login', async (req, res) => {
  try {
    const {error} = loginValidation(req.body)
    if (error) return res.json({error: error.details[0].message})
    const {email, password} = req.body
    const existed = await User.findOne({email})
    if (!existed) return res.json({error: "You're not registered yet. Please sign up"})
    const compared = await bcrypt.compare(password, existed.password)
    if (!compared) return res.json({error: 'Your email or password is incorrect'})

    const token = jwt.sign({userId: existed._id, username: existed.name, isAdmin: existed.isAdmin}, process.env.SECRET_KEY, {expiresIn: '2h'})
    res.json({token, userId: existed._id, isAdmin: existed.isAdmin})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.get('/profile', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const user = await User.findById(userId)
    res.json(user)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/profile/edit', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const user = await User.findById(userId)
    const {country, city, address, postal} = req.body
    if (country) user.country = country
    if (city) user.city = city
    if (address) user.address = address
    if (postal) user.postal = postal
    await user.save()
    res.json("You've edited your profile")
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.get('/cart', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const {cart} = await (await User.findById(userId).populate('cart.product').select('cart')).execPopulate()
    // const totalPrice = cart.reduce((total, item) => {
    //   return total += item.product.price * item.count
    // }, 0)
    res.json(cart)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
}) 

router.post('/cart/add/:id', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const user = await User.findById(userId).select('cart')
    const existed = user.cart.find(item => item.product.toString() === req.params.id)
    if (existed) {
      existed.count++ 
      await user.save()
      return res.json('Updated')
    }
    user.cart = [...user.cart, {product: req.params.id}]
    await user.save()
    res.json('Added')
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/cart/remove/:id', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const user = await User.findById(userId).select('cart')
    const existed = user.cart.find(item => item.product.toString() === req.params.id)
    if (existed.count > 1) {
      existed.count-- 
      await user.save()
      return res.json('Updated')
    } 
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.id)
    await user.save()
    res.json('Removed')
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/cart/delete/:id', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const user = await User.findById(userId).select('cart')
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.id)
    await user.save()
    res.json('Deleted')
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/cart/purchase', auth, async (req, res) => {
  try {
    const {userId} = req.user
    //  Card Payment Process
    // if (success) do below code
    const user = await User.findById(userId).select('cart')

    user.cart.map(async (item) => {
      try {
        const productDB = await Product.findById(item.product.toString())
        if (!productDB.customers.includes(userId)) productDB.customers = [...productDB.customers, userId]
        productDB.count = productDB.count - item.count
        const order = new Order({
          productId: productDB._id, 
          count: item.count, 
          customerId: userId, 
          sellerId: productDB.owner.ownerId, 
          status: 'getting order'
        })
        await productDB.save()
        await order.save()
      } catch (error) {
        res.status(400).json(`Error: ${error}`)
      }
    })

    user.cart = []
    await user.save()
    res.json('Thank you for your purchase!')
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

module.exports = router