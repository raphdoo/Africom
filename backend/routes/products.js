const express = require('express');
const router = express.Router();


const { createProduct, getProducts, getOneProduct, updateProduct, deleteProduct, createProductReview, deleteReview, getProductReviews, getAdminProducts } = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');


router.route('/products').get(getProducts);
router.route('/admin/products').get(getAdminProducts);

router.route('/product/:id').get(getOneProduct);

router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)

router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews').get(isAuthenticatedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)   


module.exports = router