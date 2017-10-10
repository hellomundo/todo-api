const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect to mongodb')
    }
    console.log('connected to mongo db')
    

    // db.collection('Todos').find({completed: false}).count().then((count) => {
    //     console.log('Todos count: ', count)
    //     //console.log(JSON.stringify(docs, undefined, 2))
        
    //     db.close()
        
    // }, (err) => {
    //     console.log('unable to fetch todos - ', err);
        
    // })

    db.collection('Users').find({name: /Edmundo/}).toArray().then((users) => {
        //console.log('Users count: ', count)
        console.log(JSON.stringify(users, undefined, 2))
        
        db.close()
        
    }, (err) => {
        console.log('unable to fetch todos - ', err);
        db.close()
    })

})
