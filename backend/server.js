const app = require('./app');
const connectDb = require('./config/database');


const cloudinary = require('cloudinary')

//Handle Uncaught Exceptions
process.on('uncaughtException', err =>{
    console.log(`errorStack: ${err.stack}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
})


// Setting up config file
require('dotenv').config({ path: 'backend/config/config.env' })

//connceting to database
connectDb()

//Set up cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, () =>{
    console.log(`server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

//Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled Promise rejection`);
    server.close(() =>{
        process.exit(1)
    })
})