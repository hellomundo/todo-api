const expect = require('chai').expect
const request = require('supertest')
const {ObjectId} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')

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

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
})

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text'

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).to.equal(text)
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).to.equal(1)
                    expect(todos[0].text).to.equal(text)
                    done()
                }).catch((e) => {
                    done(e)
                })
            })
    })

    it('should not create todo with invalid body data', (done) => {
        var text = ''

        request(app)
            .post('/todos')
            .send({text})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                Todo.find().then((todos) => {
                    expect(todos.length).to.equal(2)
                    done()
                }).catch((e) => done(e))
            })
    })
})

describe('GET /todos', () => {
    it('should return two items', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(2)
            })
            .end(done)
    })
})

describe('GET /todos:id', () => {
    let id = todos[0]._id.toHexString()
    it('should return todo doc when valid id is passed', (done) => {
        request(app)
            .get('/todos/'+id)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(id)
            })
            .end(done)
    })

    it('should return a 404 if todo not found', (done) => {
        let badid = new ObjectId().toHexString()
        request(app)
            .get('/todos/'+badid)
            .expect(404)
            .end(done)
    })

    it('should return a 404 for non-valid ids', (done) => {
        request(app)
            .get('/todos/1234')
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:item', () => {
    it('should remove a todo if id is valid', (done) => {
        id = todos[1]._id.toHexString()
        request(app)
            .delete('/todos/'+id)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(id)
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                // database should not contain that id
                Todo.findById(id).then((todo) => {
                    console.log('found todo: ', todo)
                    expect(todo).to.be.null
                    done()
                }).catch((e) => done(e))
            })
    })

    it('should return 404 if todo not found', (done) => {
        let badid = new ObjectId().toHexString()
        request(app)
            .delete('/todos/'+badid)
            .expect(404)
            .end(done)
    })

    it('should return 404 if ObjectId is invalid', (done) => {
        request(app)
            .delete('/todos/12345')
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should set completedAt when completed is true', (done) => {
        let id = todos[0]._id.toHexString()
        let text = "I like bananas"
        let body = { 
            text: text,
            completed: true 
        }
        request(app)
            .patch('/todos/'+id)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(text)
                expect(res.body.todo.completed).to.equal(true)
                expect(res.body.todo.completedAt).to.be.a('number')
            })
            .end(done)
        
    })

    it('should clear completedAt when completed is false', (done) => {
        let id = todos[1]._id.toHexString()
        let body = { 
            completed: false 
        }
       request(app)
            .patch('/todos/'+id)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).to.equal(false)
                expect(res.body.todo.completedAt).to.equal(null)
            })
            .end(done)
    })
})