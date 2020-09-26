const {Router} = require('express')
const router = Router()
const User = require('../models/userModel')
const Product = require('../models/productModel')
const auth = require('../middlewares/verifyToken')
const isAdmin = require('../middlewares/isAdmin')

//  /?page=0&field=price&order=asc
router.get('/', async (req, res) => {
  try {
    const {genre, author, rangeFrom, rangeTo} = req.query
    let filter = {}
    if (genre) filter = {genre}
    if (author) filter = {author}

    const products = await Product.find(filter)
    // for range
    const rangeProducts = products.slice().sort((a, b) => a['price'] > b['price'] ? 1 : -1)
    const minPrice = rangeProducts[0].price
    const maxPrice = rangeProducts[rangeProducts.length - 1].price

    if (rangeFrom && rangeTo) {
      const rangedProducts = await Product.find(filter).where('price').gte(rangeFrom).lte(rangeTo)
      return res.json({products: rangedProducts, minPrice, maxPrice})
    } 
    
    res.json({products, minPrice, maxPrice})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const existed = await Product.findById(req.params.id)
    if (!existed) return res.json({error: "Product doesn't exist"})
    // другие продукты продавца
    const {products} = await (await User.findById(existed.owner.ownerId).populate('products.product').select('products.product')).execPopulate()
    res.json({product: existed, otherProducts: products})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/add/rate/:id', auth, async (req, res) => {
  try {
    const {userId} = req.user
    const {rate} = req.body
    if (!rate) return res.json({error: "Your rate is invalid"})
    const existed = await Product.findById(req.params.id)
    if (!existed) return res.json({error: "Product doesn't exist"})
    const included = existed.rating.find(item => item.userId === userId)
    if (included) {
      included.rate = rate
      await existed.save()
      return res.json({success: `You made a new rate with ${rate} star(-s)`})
    }
    existed.rating = [...existed.rating, {userId, rate}]
    await existed.save()
    res.json({success: `You rated this book by ${rate} star(-s)`})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/add/comment/:id', auth, async (req, res) => {
  try {
    const {username} = req.user
    const {text} = req.body
    if (!text) return res.json({error: "Field can't be empty!"})
    const existed = await Product.findById(req.params.id)
    if (!existed) return res.json({error: "Product doesn't exist"})
    existed.comments = [...existed.comments, {userName: username, text}]
    await existed.save()
    res.json({success: "You added a new comment"})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

// Creator's section below //

// продукты продавца
router.get('/self/products', auth, isAdmin, async (req, res) => {
  try {
    const {userId} = req.user
    const {products} = await (await User.findById(userId).populate('products.product').select('products')).execPopulate()
    res.json(products)
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/add', auth, isAdmin, async (req, res) => {
  try {
    const {username, userId} = req.user
    const {name, image, author, genre, price, count} = req.body
    if (!name || !image || !author || !genre || !price || !count) return res.json({error: "You must fill all fields!"})
    // owner's info from req.user
    const created = new Product({
      name, image, author, genre, price, count, owner: {ownerName: username, ownerId: userId}
    })

    //seller
    const seller = await User.findById(userId)
    seller.products = [...seller.products, {product: created._id}]
    await created.save()
    await seller.save()
    res.json({success: "You successfuly created a new product"})
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.post('/edit/:id', auth, isAdmin, async (req, res) => {
  try {
    const {userId} = req.user
    const existed = await Product.findById(req.params.id)
    if (!existed) return res.json({error: "Product doesn't exist"})
    if (existed.owner.ownerId.toString() !== userId) return res.json({error: "You can't edit it because you aren't owner!"})
    const {name, image, author, genre, price, count} = req.body
    if (name) existed.name = name
    if (image) existed.image = image
    if (author) existed.author = author
    if (genre) existed.genre = genre
    if (price) existed.price = price
    if (count) existed.count = count
    await existed.save()
    res.json("You edited your product")
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

router.delete('/delete/:id', auth, isAdmin, async (req, res) => {
  try {
    const {userId} = req.user
    const existed = await Product.findById(req.params.id)
    if (!existed) return res.json({error: "Product doesn't exist"})
    if (existed.owner.ownerId !== userId) return res.json({error: "You can't delete it because you aren't owner!"})
    const deleted = await Product.findByIdAndDelete(req.params.id)
    if (!deleted) return res.json({error: 'Oops! Smth went wrong with deleting this post...'})
    res.json("You deleted your product")
  } catch (error) {
    res.status(400).json(`Error: ${error}`)
  }
})

module.exports = router


//  const products = await Product.find(filter).where('price').gte(rangeFrom).lte(rangeTo).skip(12 * page).limit(12).sort([[field, order]])
