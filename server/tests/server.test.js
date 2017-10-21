const expect = require('chai').expect
const request = require('supertest')
const {ObjectId} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')
const {User} = require('./../models/user')
const {todos, populateTodos, users, populateUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text'

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
    it('should return one item', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(1)
            })
            .end(done)
    })
})

describe('GET /todos:id', () => {
    let id = todos[0]._id.toHexString()
    it('should return todo doc when valid id is passed', (done) => {
        request(app)
            .get('/todos/'+id)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(id)
            })
            .end(done)
    })

    it('should not return todo from another user', (done) => {
        request(app)
            .get('/todos/'+todos[1]._id.toHexString())
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return a 404 if todo not found', (done) => {
        let badid = new ObjectId().toHexString()
        request(app)
            .get('/todos/'+badid)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return a 404 for non-valid ids', (done) => {
        request(app)
            .get('/todos/1234')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:item', () => {
    it('should remove a todo if id is valid', (done) => {
        id = todos[1]._id.toHexString()
        request(app)
            .delete('/todos/'+id)
            .set('x-auth', users[1].tokens[0].token)
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

    it('should not remove a todo of another user', (done) => {
        id = todos[1]._id.toHexString()
        request(app)
            .delete('/todos/'+id)
            .set('x-auth', users[0].tokens[0].token) // not the creator
            .expect(404)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                // database should not contain that id
                Todo.findById(id).then((todo) => {
                    console.log('found todo: ', todo)
                    expect(todo).to.exist
                    done()
                }).catch((e) => done(e))
            })
    })

    it('should return 404 if todo not found', (done) => {
        let badid = new ObjectId().toHexString()
        request(app)
            .delete('/todos/'+badid)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if ObjectId is invalid', (done) => {
        request(app)
            .delete('/todos/12345')
            .set('x-auth', users[1].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(text)
                expect(res.body.todo.completed).to.equal(true)
                expect(res.body.todo.completedAt).to.be.a('number')
            })
            .end(done)
        
    })

    it('should not update todo of another user', (done) => {
        let id = todos[1]._id.toHexString()
        let text = "I like bananas"
        let body = { 
            text: text,
            completed: true 
        }
        request(app)
            .patch('/todos/'+id)
            .set('x-auth', users[0].tokens[0].token)
            .send(body)
            .expect(404)
            .end(done)
    })

    it('should clear completedAt when completed is false', (done) => {
        let id = todos[1]._id.toHexString()
        let body = { 
            completed: false 
        }
       request(app)
            .patch('/todos/'+id)
            .set('x-auth', users[1].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).to.equal(false)
                expect(res.body.todo.completedAt).to.equal(null)
            })
            .end(done)
    })

})

describe('GET /users/me', () => {
    it('should return a user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                console.log('user: ', users[0])
                expect(res.body._id).to.equal(users[0]._id.toHexString())
                expect(res.body.email).to.equal(users[0].email)
            })
            .end(done)
    })

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).to.eql({})
            })
            .end(done)
    })
})

describe('POST /users/', () => {
    it('should create a user when valid data passed in', (done) => {
        let user = {
            email: 'happy@smooshy.com',
            password: 'thegoodpass2'
        }
        request(app)
            .post('/users/')
            .send(user)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).to.equal(user.email)
                expect(res.body._id).to.exist
                expect(res.headers['x-auth']).to.exist
                
            })
            .end((err) => {
                if(err) {
                    return done(err)
                }

                User.findOne({email: user.email}).then((res) => {
                    expect(res).to.exist
                    expect(res.password).does.not.equal(user.password)
                    done()
                }).catch((e) => done(e))
            })
    })

    it('should return validation errors if request is invalid', (done) => {
        let user = {
            email: 'stu@b',
            password: '999'
        }
        request(app)
            .post('/users/')
            .send(user)
            .expect(400)
            .end(done)
    })

    it('should not create user if email already exists', (done) => {
        let user = {
            email: users[0].email, // from users test data
            password: 'goodpass99'
        }
        request(app)
            .post('/users/')
            .send(user)
            .expect(400)
            .end(done)
    })
})

describe('POST /users/signin', () => {
    it('should log in user with valid credentials and return auth token', (done) => {
        let credentials = {
            email: users[1].email,
            password: users[1].password
        }
        request(app)
            .post('/users/signin')
            .send(credentials)
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).to.exist
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).to.include({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })

                    done()
                }).catch((e) => done(e))
            })
    })

    it('should reject invalid login', (done) => {
        let credentials = {
            email: 'bob@blah.co',
            password: 'bac12io'
        }
        request(app)
            .post('/users/signin')
            .send(credentials)
            .expect(400)
            .end(done)
            
    })
})

describe('DELETE /users/me/token', () => {
    it('should delete auth token from user in db', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                // find user in db and make sure token is gone
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).to.equal(0)
                    done()
                }).catch((e) => done(e))
            })   
    })
})