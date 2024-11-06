require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))
let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response, next)=>
{
    Person.find({})
      .then((persons)=> response.json(persons))
      .catch((err)=> next(err))
})

app.get('/info', (request, response, next)=>
{
    Person.countDocuments()
      .then((result)=>
      {
        return response.send(`<div>
                                <p>Phonebook has info for ${result} people</p>
                                <p>${new Date()}</p>
                              <div>`)
      })
      .catch((err)=> next(err))
})

app.get('/api/persons/:id', (request, response, next)=>
{
    const id = request.params.id
    Person.findById(id)
      .then(person => {
        return response.json(person)
      })
      .catch((err)=> next(err))
      
})

app.delete('/api/persons/:id', (request, response, next)=>
{
    const id = request.params.id
    Person.findByIdAndDelete(id)
      .then(()=> response.status(204).end())
      .catch((err)=> next(err))
})

app.post('/api/persons', (request, response, next)=>
{
    const {name, number} = request.body
    if(!name) return response.status(400).json({error: "name is required"}).end()
    if(!number) return response.status(400).json({error: "number is required"}).end()
    const person = phonebook.find(person=>person.name === name)
    if(person) return response.status(400).json({error: "name must be unique"}).end()

    const newPerson = new Person({name, number})
    newPerson.save()
      .then((newOne)=> response.json(newOne))
      .catch((err)=> next(err))
    // response.json(newPerson).end()
})

app.put('/api/persons/:id', (request, response, next)=>
{
    const {name, number} = request.body
    const id = request.params.id
    const newPersonData = {name, number}
    Person.findByIdAndUpdate(id, newPersonData, {new: true, runValidators: true, context:'query'})
      .then((modifiedPerson)=>
      {
        return response.json(modifiedPerson)
      })
      .catch((err)=>next(err))
})
const errHandler = (err, request, response, next)=>
{
    const message = err.message
    const name = err.name
    console.log({name, message})
    
    switch(name)
    {
      case "CastError":
        response.stats(400).json({error: "Malformatted id"}).end()
        break
      case 'ValidationError':
        response.status(400).json({error: message}).end()
        break
      default: response.status(500).json({name, message})
    }
}

app.use(errHandler)
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log(`Server is running... on port ${PORT}`))