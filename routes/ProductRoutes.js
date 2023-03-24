const router = require('express').Router()
const ProductController = require('../controllers/ProductController')

// MIDDLE
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require('../helpers/image-upload')

router.post('/create', verifyToken, imageUpload.array('images'), ProductController.create)
router.get('/', ProductController.getAll)
router.get('/myproduct', verifyToken, ProductController.getAllUserProdu)
router.get('/myrenting', verifyToken, ProductController.getAllRenting)
router.get('/:id', ProductController.getProductById)
router.delete('/:id', verifyToken, ProductController.removeProductId)
router.patch('/:id', verifyToken, imageUpload.array('images'), ProductController.updateProduct)
router.patch('/conclude/:id', verifyToken, ProductController.conclude)


module.exports = router