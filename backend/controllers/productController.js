const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const APIfeatures = require('../utils/apiFeatures');

const cloudinary = require('cloudinary');

//Create a new product -> /api/v1/product/new
exports.createProduct = catchAsyncErrors( async(req, res, next) => {

    //handle single image and multiple image upload
    let images = [];
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)
    }else{ images= req.body.images}

    let imagesLinks = [];
    for (let i = 0; i<images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });

})

//Get all products -> /api/v1/products?keyword=name
exports.getProducts =catchAsyncErrors( async (req, res, next) => {

    const resultPerPage = 4;
    const productsCount = await Product.countDocuments()
    
    const apiFeatures = new APIfeatures(Product.find(), req.query)
    .search()
    .filter()

    let products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    apiFeatures.pagination(resultPerPage)
    products = await apiFeatures.query.clone();

        res.status(200).json({
            success: true,
            productsCount,
            filteredProductsCount,
            products,
            resultPerPage
        })
    
    
})

//Get all products - Admin -> /api/v1/admin/products
exports.getAdminProducts =catchAsyncErrors( async (req, res, next) => {

    const products = await Product.find()

        res.status(200).json({
            success: true,
            products,

        })
    
    
})

//Get single product -> /api/v1/product/:id
exports.getOneProduct =catchAsyncErrors( async (req, res, next) =>{
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success:true,
        product
    });
})

//Update a product -> api/v1/admin/product/:id
exports.updateProduct =catchAsyncErrors( async(req, res, next) =>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    //handle single image and multiple image upload
    let images = [];
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)
    }else{ images = req.body.images}

    if (images !== undefined) {
        for (let i = 0; i<product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    
        }

        let imagesLinks = [];
        for (let i = 0; i<images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
    }

    req.body.images = imagesLinks;

    }


    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product -> /api/v1/admin/product/:id
exports.deleteProduct =catchAsyncErrors( async (req, res, next) =>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    //Deleting images
    if (product.images){
        for (let i = 0; i<product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    
        }
    }

    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: "Product is deleted."
    })
})

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        rev => rev.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true
    })
})