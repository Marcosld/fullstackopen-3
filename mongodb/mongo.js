const mongoose = require('mongoose')

mongoose.Promise = Promise

const args = process.argv

if (args.length < 3) {
    console.log('Please, specify password')
    process.exit(1)
}

const password = args[2]

const uri = `mongodb+srv://marcosld:${password}@cluster0-4ci0s.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.log(err))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    }
})

const Person = mongoose.model('Person', personSchema)

if (args.length === 3) {
    Person
        .find({})
        .then(console.log)
        .then(() => mongoose.connection.close())
    return;
}

const person = new Person({name: args[3], number: args[4]})

person.save()
    .then(() => console.log('Done!'))
    .catch(console.error)
    .finally(() => mongoose.connection.close())
