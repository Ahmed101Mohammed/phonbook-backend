const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
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

app.get('/api/persons', (request, response)=>
{
    return response.json(phonebook).end()
})

app.get('/info', (request, response)=>
{
    return response.send(`<div>
                            <p>Phonebook has info for ${phonebook.length} people</p>
                            <p>${new Date()}</p>
                        <div>`)
})

app.get('/api/persons/:id', (request, response)=>
{
    const id = request.params.id
    const person = phonebook.find(personP=>personP.id === id)
    if(!person) return response.status(404).end()
    response.json(person)
})

app.delete('/api/persons/:id', (request, response)=>
{
    const id = request.params.id
    phonebook = phonebook.filter(person=> person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response)=>
{
    const id = Math.trunc(Math.random() * 1000000000)
    const {name, number} = request.body
    if(!name) return response.status(400).json({error: "name is required"}).end()
    if(!number) return response.status(400).json({error: "number is required"}).end()
    const person = phonebook.find(person=>person.name === name)
    if(person) return response.status(400).json({error: "name must be unique"}).end()

    const newPerson = {id, name, number}
    phonebook = phonebook.concat(newPerson)
    response.json(newPerson).end()
})
const PORT = 3001
app.listen(PORT, ()=> console.log(`Server is running... on port ${PORT}`))