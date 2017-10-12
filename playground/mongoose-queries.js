const {ObjectID} = require('mongodb')

const {mongoose} = require('./../server/db/mongoose')
const {Todo} = require('./../server/models/todo')

var id = '59de9e90689113b37f9720f011'

// Todo.find({
//     _id: id
// }).then((todos) => {
//     if(todos.length === 0) {
//         return console.log('No docs with that id')
//     }
//     console.log('todos: ', todos);
// })

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     if(!todo) {
//         return console.log('ID not found')
//     }
//     console.log('todo: ', todo);
// })

Todo.findById(id).then((todo) => {
    if(!todo) {
        return console.log('ID not found')
    }
    console.log('todo: ', todo)
}).catch((e) => {
    console.log('got the error: ', e)
})