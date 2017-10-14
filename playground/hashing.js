const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')


let message = "I am a message"
let hash = SHA256(message).toString()

var data = {
    id: 4
}

var token = jwt.sign(data,'mysecretphrase')

console.log('token: ', token)

try {
    result = jwt.verify(token + 1, 'mysecretphrase')
    console.log('decoded data: ', result)
} catch (e) {
    console.log('there was an error decoding the token')
}

//console.log(`Message was: ${message} and hash was: ${hash}`)
