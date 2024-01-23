require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('req-body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(express.static('static_dist'))
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
app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => {
            console.log('Error fetching phonebook: ', error)
        })
})

app.get('/info', (request, response) => {
    response.send(getHTMLPage())
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }            
        })
        .catch(error => {
            console.log('Error fetching person: ', error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

app.delete('/api/persons/:id', (request, response) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            console.log("error: ", error)
            response.status(404).end()
        })
})

app.post('/api/persons', (request, response) => {
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
        .catch(error => {
            console.log('Error adding person: ', error)
            response.status(400).json(error)
        })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))