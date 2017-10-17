const {ObjectId} = require('mongodb')
const jwt = require('jsonwebtoken')

const {Todo} = require('./../../models/todo')
const {User} = require('./../../models/user')

let tempId1 = new ObjectId()
let tempId2 = new ObjectId()

const users = [{
    _id: tempId1,
    email: 'ed@superspeed.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: tempId1.toHexString(), access: 'auth'}, "abc123").toString()
    }]
}, {
    _id: tempId2,
    email: 'kari@superspeed.com',
    password: 'secretpass',
}]

const todos = [{
    _id: new ObjectId(),
    text: 'First test todo',
    completed: false
}, {
    _id: new ObjectId(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save()
        var userTwo = new User(users[1]).save()

        return Promise.all([userOne, userTwo])
    }).then(() => {
        done()
    })
}

module.exports = {todos, populateTodos, users, populateUsers}