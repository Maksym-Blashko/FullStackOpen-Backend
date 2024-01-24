require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('req-body', (req) => JSON.stringify(req.body))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    switch (error.name) {
        case 'CastError':
            return response.status(400).json({ error: 'malformatted id' })
        case 'ValidationError':
            return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(cors())
app.use(express.static('static_dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

// Data
let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Methods
getCurrentDate = () => {
    const date = new Date()
    const dayOfWeek = daysOfWeek[date.getDay()]
    const day = date.getDate()
    const year = date.getFullYear()
    const month = months[date.getMonth()]
    const hour = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const timezoneOffset = date.getTimezoneOffset()

    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    const res = `${dayOfWeek} ${month} ${day}, ${year} ${formattedHour}:${formattedMinutes}:${formattedSeconds} UTC${timezoneOffset < 0 ? '+' : '-'}${Math.abs(timezoneOffset / 60)}`;
    console.log(res)

    return res
}

getInfoPage = (totalPersons) => {
    const page = `
        <div>
            <p>Phonebook has info for ${totalPersons} people</p>
            <p>${getCurrentDate()}</p>
        </div>`

    return page
}

// Requests
app.get('/api/persons', (request, response, next) => {
    Person
        .find({})
        .then(persons => response.json(persons))
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person
        .countDocuments({})
        .then(totalPersons => response.send(getInfoPage(totalPersons)))
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person
        .findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(() => response.status(204).end())
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const person = new Person({
        name: request.body.name,
        number: request.body.number,
    })

    person
        .save()
        .then(savedPerson => {
            console.log(`added ${savedPerson.name} ${savedPerson.number}`)
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))