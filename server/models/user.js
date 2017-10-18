const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')


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

userSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({email}).then((user) => {
        if(!user) {
            return Promise.reject('Could not find that user.')
        }
        
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password).then((isMatching) => {
                if(isMatching) {
                    return resolve(user)
                }
                console.log('did not match')
                return reject('Password does not match.')
            })
        })
    })
}

userSchema.statics.findByToken = function(token) {
    const User = this
    var decoded

    try {
        decoded = jwt.verify(token, 'abc123')
        //console.log('successfully decoded token: '+decoded._id)
    } catch (err) {
        //console.log('could not decode token')
        return Promise.reject()
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

userSchema.pre('save', function(next) {
    var user = this;
    // check to see if password has been modified
    // so that we can re encrypt
    if(user.isModified('password')) {
        bcrypt.genSalt(10).then((salt) => {
            bcrypt.hash(user.password, salt).then((hashed) => {
                user.password = hashed;
                next()
            })
        }).catch((e) => {
            console.log('error hashing password')
        })
    } else {
        next()
    }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}