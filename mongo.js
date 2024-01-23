const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

// Connect to DB
const password = process.argv[2]
const url = `mongodb+srv://blashkoma:${password}@cluster0.bivmazt.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Create schema for model Person
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

// Add new person if there are arguments name and number
const name = process.argv[3] || ''
const number = process.argv[4] || ''

if (name.length > 0 && number.length > 0) {
    const person = new Person({
        name: name,
        number: number,
    })

    person
        .save()
        .then(result => {
            console.log(`added ${result.name} ${result.number}`)
            mongoose.connection.close()
        })
        .catch(error => {
            console.error('Error adding person: ', error)
            mongoose.connection.close()
        })
} else {
    // Print all persons from phonebook
    Person
        .find({})
        .then(persons => {
            console.log('phonebook:')
            persons.forEach(person => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
        })
        .catch(error => {
            console.error('Error fetching phonebook: ', error)
            mongoose.connection.close()
        })
}