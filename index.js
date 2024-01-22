const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('req-body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

// Data
let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

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

getPerson = (idString) => {
    const id = Number(idString)
    const person = persons.find(person => person.id === id)
    return person
}

deletePerson = (idString) => {
    const id = Number(idString)
    const person = persons.find(person => person.id === id)
    if (person) {
        persons = persons.filter(person => person.id !== id)
    }
    return person
}

addPerson = (body) => {
    const person = {
        "id": generateID(),
        "name": body.name,
        "number": body.number
    }
    persons = persons.concat(person)
    return person
}

generateID = () => Math.floor(Math.random() * 1000000)

validateRequest = (request) => {
    if (!request.body) {
        return { error: 'content missing' }
    }

    const { name, number } = request.body
    if (!name || !number) {
        return { error: 'Name and Number are required fields' }
    }

    if (persons.some(person => person.name === name)) {
        return { error: 'Name already exists in the phonebook' }
    }
}

// Requests
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(getHTMLPage())
})

app.get('/api/persons/:id', (request, response) => {
    const person = getPerson(request.params.id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const person = deletePerson(request.params.id)

    if (person) {
        response.status(204).end()
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const error = validateRequest(request)
    if (error) {
        return response.status(400).json(error)
    }

    const person = addPerson(request.body)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))