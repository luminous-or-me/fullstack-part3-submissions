require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('body', (request, response) => {
    if (request.method === 'POST') {
        return JSON.stringify(request.body)
    } else {
        return " "
    }
})

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345'
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122'
    }
]

app.get('/info', (request, response) => {
    Person.find({})
        .then(persons => {
            response.send((
                `
                <div>
                    <p>Phonebook has info for ${persons.length} people</p>
                    <p>${new Date().toUTCString()}</p>
                </div>
                `
            ))
        })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
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
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(addedPerson => {
            response.json(addedPerson)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})