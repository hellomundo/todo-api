const express = require('express')
const bodyParser = require('body-parser')
//const {ObjectId} = require('mongodb')

const {mongoose} = require('./db/mongoose.js')
const {Todo} = require('./models/todo.js')
const {User} = require('./models/user.js')

const port = process.env.PORT || 2000

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
        //console.log('error: ', err)
        res.status(400).send(err)
    }) 
})

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.status(200).send({todos})
    }).catch((err) => {
        //console.log('error: ', err)
        res.status(400).send(err)
    })
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send()
    }

    Todo.findById({_id: id}).then((todo) => {
        if(!todo) {
            return res.status(404).send()
        }
        res.status(200).send({todo})
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.listen(port, () => {
    console.log(`Started server on port ${port}`);
    
})

module.exports.app = app