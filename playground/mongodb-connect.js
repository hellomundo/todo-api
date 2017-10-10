// const MongoClient = require('mongodb').MongoClient
const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect to mongodb')
    }
    console.log('connected to mongo db')
    
    // db.collection('Todos').insertOne({
    //     text: 'something to do',
    //     completed: false

    // }, (err, result) => {
    //     if(err) {
    //         console.log('unable to get data');
            
    //     } 

    //     console.log(JSON.stringify(result.ops, undefined, 2));
        
    // })

    // db.collection('Users').insertOne({
    //     name: 'Edmundo Ortega',
    //     age: 23,
    //     location: 'Santa Cruz, CA'

    // }, (err, result) => {
    //     if(err) {
    //         console.log('unable to insert user');
            
    //     } 

    //     console.log(JSON.stringify(result.ops, undefined, 2));
        
    // })
    var userObject = {
        name: "Kari Files",
        age: 43,
        location: 'Capitola, CA'
    }

    db.collection('Users').insertOne(userObject)
        .then(res => {
            if(res.n >= 0) {
                console.log('sucessfully inserted one item');     
            }
            console.log(JSON.stringify(res.ops, undefined, 2))
            console.log('result n: ', res.result.n)

            console.log(`inserted at: ${res.ops[0]._id.getTimestamp()}`);
            
            
 
            db.close()
        })
        .catch((err) => {
            console.log('got an error inserting my ojbect')
        })

})
