const express = require('express')
const bodyParser = require('body-parser')

const {mongoose} = require('./db/mongoose.js')
const {Todo} = require('./models/todo.js')
const {User} = require('./models/user.js')

const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        console.log('error: ', err)
        res.status(400).send(err)
    })
    
})

app.listen(2000, () => {
    console.log('Started server on port 2000');
    
})

module.exports.app = app