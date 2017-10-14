const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')


var userSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail, // use the function from the validator library
            message: '{VALUE} is not a valid email.',
            isAsync: false // needed because isEmail takes 2 values
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.toJSON = function() {
    user = this
    userObject = user.toObject()
    return _.pick(userObject, ['_id', 'email'])
}

// can't use arrow function because arrow function doesn't bind 'this' keyword
userSchema.methods.generateAuthToken = function() {
    let user = this
    let access = 'auth'
    let token = jwt.sign({_id: user._id.toHexString(), access: access}, "abc123").toString()

    user.tokens.push({
        access,
        token
    })

    // returning the promise from save() so we can chain on to it later
    return user.save().then((res) => {
        return token
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}