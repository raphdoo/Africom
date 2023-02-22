const Product = require('../models/product');
const dotenv = require('dotenv');

const connectDb = require('../config/database');

const products = require('../data/data.json');


// setting dotev file
dotenv.config({path: 'backend/config/config.env'})

connectDb();

const seedProducts = async () =>{
    try{
        await Product.deleteMany();
        console.log('All Products are deleted');

        await Product.insertMany(products);
        console.log('All Products are added');

        process.exit()
    }catch(err){
        console.log(err.message);
        process.exit();
    }
}

seedProducts()