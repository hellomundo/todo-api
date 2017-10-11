const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect to mongodb')
    }
    console.log('connected to mongo db')
    
    // db.collection('Todos').deleteMany({name: 'eat lunch'}).then((result) => {
    //     console.log(result)
        
    //     db.close()
        
    // }, (err) => {
    //     console.log('unable to fetch todos - ', err);
    //     db.close()
    // })

    db.collection('Users').findOneAndDelete({_id: new ObjectID('59dd1a8681731f99ce3e0737')}).then((result) => {
        console.log(result)
        
        db.close()
        
    }, (err) => {
        console.log('unable to fetch todos - ', err);
        db.close()
    })

})
