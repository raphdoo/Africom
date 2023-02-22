const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const cloudinary = require('cloudinary');

const crypto = require('crypto');


//register a user -> /api/v1/register
exports.registerUser = catchAsyncErrors (async (req, res, next) => {
    
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale'
    })
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    })

    sendToken(user, 200, res);
})

//login a user -> /api/v1/login
exports.loginUser = catchAsyncErrors( async(req,res,next)=>{
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new ErrorHandler('please enter email & password', 400))
    }

    //Find user in database
    const user = await User.findOne({email}).select('+password')

    if(!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    //Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);

})

//Forgot password -> /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('User with email provided not found', 404));
    }

    //Get reset token
    const resetToken = user.getPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    //create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Follow the link below to reset your password:\n\n${resetUrl}\n\nIf you have not requested for a change, then ignore this message`;

    try{
        
        await sendEmail({
            email: user.email,
            subject: "Africom password recovery",
            message

        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })

    }catch(err){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(err.message, 500));

    }
})


//Reset password -> /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {


    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ resetPasswordToken: resetPasswordToken, resetPasswordExpire: {$gt:Date.now()}});

    if(!user) {
        return next(new ErrorHandler('password reset token is invalid or has been expired', 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400));
    }

    //Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)
})

//Update user profile -> /api/v1/me/update
exports.updateProfile = catchAsyncErrors((async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //Update avatar
    if(req.body.avatar !== ""){
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id)

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale'
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success:true
    })
}))

//Update / Change user password -> /api/v1/password/update
exports.updatePassword = catchAsyncErrors( async(req, res, next) =>{
    const user = await User.findById(req.user.id).select('+password');

    //Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);

    if(!isMatched){
        return next (new ErrorHandler('Old password is incorrect'), 401)
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res)

})


//logout a user -> /api/v1/logout
exports.logoutUser = catchAsyncErrors( async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

//Get currently logged in user details -> /api/v1/me
exports.getUserProfile = catchAsyncErrors( async(req, res, next) => {
    
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})


//Admin Routes

//Get all users -> /api/v1/admin/users

exports.getAllUsers = catchAsyncErrors( async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })
})

//Get User details -> /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`user with id ${req.params.id} not found`), 401)
    }

    res.status(200).json({
        success:true,
        user
    })
})

//Update user profile -> /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors((async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success:true,
        user
    })
}))

//Delete user profile -> /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors((async(req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`user with id ${req.params.id} not found`), 401)
    }

    //Remove avatar from cloudinary server
    const image_id = user.avatar.public_id;
    if (image_id) {
        await cloudinary.v2.uploader.destroy(image_id);
    }
    

    await user.remove();

    res.status(200).json({
        success:true
    })
}))