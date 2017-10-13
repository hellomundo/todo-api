const expect = require('chai').expect
const request = require('supertest')
const {ObjectId} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')

const todos = [{
    _id: new ObjectId(),
    text: 'First test todo'
}, {
    _id: new ObjectId(),
    text: 'Second test todo'
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