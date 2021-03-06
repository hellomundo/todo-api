require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')

const {mongoose} = require('./db/mongoose.js')
const {Todo} = require('./models/todo.js')
const {User} = require('./models/user.js')
const {authenticate} = require('./middleware/authenticate')

const port = process.env.PORT

const app = express()

app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
    console.log(req.body);
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    })

    todo.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        //console.log('error: ', err)
        res.status(400).send(err)
    }) 
})

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.status(200).send({todos})
    }).catch((err) => {
        //console.log('error: ', err)
        res.status(400).send(err)
    })
})

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send()
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo) {
            return res.status(404).send()
        }
        res.status(200).send({todo})
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.delete('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send()
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo) {
            return res.status(404).send()
        }

        res.status(200).send({todo})
    }).catch((err) => {
        res.status(400).send(err)
    })

})

app.patch('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id

    // limit the properties the user can update
    var body = _.pick(req.body, ['text','completed'])

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send()
    }

    // updated the completedAt property if completed is true
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false;
        body.completedAt = null
    }

    Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, {$set: body}, {new: true}).then((todo) => {
        console.log('todo: ', todo)
        if(!todo) {
            return res.status(404).send()
        }

        res.status(200).send({todo})
    }).catch((err) => {
        res.status(400).send()
    })

})

// users
// sign up
app.post('/users', (req, res) => {
    console.log(req.body)
    let body = _.pick(req.body, ['email', 'password'])
    var user = new User(body)

    user.save().then(() => {
        return user.generateAuthToken()
    }).then((token) => {
        res.header('x-auth', token).send(user)
    }).catch((err) => {
        console.log("err: ", err)
        res.status(400).send(err)
    })
})

// login

app.post('/users/signin', (req, res) => {
    console.log('req.body')
    let body = _.pick(req.body, ['email', 'password'])
    // find user by email
    User.findByCredentials(body.email, body.password).then((user) => {
        console.log('user: ', user)
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user)
        })
    }).catch((err) => {
        console.log('error: ', err)
        res.status(400).send(err)
    })

})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
})

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)
})

app.listen(port, () => {
    console.log(`Started server on port ${port}`);
    
})

module.exports.app = app