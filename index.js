require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('req-body', (req) => JSON.stringify(req.body))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(cors())
app.use(express.static('static_dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))
app.use(errorHandler)

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

getHTMLPage = () => {
    const page = `
        <div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${getCurrentDate()}</p>
        </div>`

    return page
}

validateRequest = (request) => {
    if (!request.body) {
        return { error: 'content missing' }
    }

    const { name, number } = request.body
    if (!name || !number) {
        return { error: 'Name and Number are required fields' }
    }

    // TODO: impl in next exercises 
    // if (persons.some(person => person.name === name)) {
    //     return { error: 'Name already exists in the phonebook' }
    // }
}

// Requests
app.get('/api/persons', (request, response, next) => {
    Person
        .find({})
        .then(persons => response.json(persons))
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    response.send(getHTMLPage())
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

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const error = validateRequest(request)
    if (error) {
        return response.status(400).json(error)
    }

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))