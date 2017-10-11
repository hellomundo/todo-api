const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect to mongodb')
    }
    console.log('connected to mongo db')
    

    // db.collection('Todos').findOneAndUpdate(
    //     {   _id: new ObjectID('59dbfa66e1a7b695f795bbae')}, 
    //     {   $set: { completed: true } }, 
    //     {   returnOriginal: false }
    // ).then((res) => {
    //     console.log(res);
    // })

    db.collection('Users').findOneAndUpdate(
        {   _id: new ObjectID('59dbfae32509f395fe7b2499')}, 
        {   $set: { name: 'Chuck Taylor' },
            $inc: { age: 1 } }, 
        {   returnOriginal: false }

    ).then((res) => {
        console.log(res)
        db.close()
        
    }).catch((err) => {
        console.log(err)
        db.close()
    })

})
