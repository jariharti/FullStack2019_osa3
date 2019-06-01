/* Jari Hartikainen, 29.5.2019 */
/* Aalto University, Course: Full Stack Web Development, Part 3: Puhelinluettelon backend step1 ... step11*/

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

// custom token to log req string to console
morgan.token('req_string', function getReqString (req) {
  return JSON.stringify(req.body)
})

// use morgan library to log messages to console
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.req_string(req,res)
  ].join(' ')
}))

let  persons = [
      {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
      },
      {
        name: "Martti Tienari",
        number: "040-123456",
        id: 2
      },
      {
        name: "Arto Järvinen",
        number: "040-123456",
        id: 3
      },
      {
        name: "Lea Kutvonen",
        number: "040-123456",
        id: 4
      }
    ]

// User wants to add a new person to the phonebook
app.post('/api/persons', (request,response) => {


  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id)) 
    : 0

  const new_person = {
    name: request.body.name || false,
    number: request.body.number || false,
    id: maxId+1
  }
  var is_new_name = persons.find(all_persons => all_persons.name === new_person.name)

  if (!new_person.name) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  } else if (!new_person.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  } else if (is_new_name) {
    return response.status(400).json({ 
      error: 'name must be unique'
    })
  }
  else {
    persons = persons.concat(new_person)
    response.json(persons)
    return response.status(200).end()
  }
})

// User wants to delete person from the phonebook
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const id_exist = (persons.filter(person => person.id === id)).length > 0
    ? true
    : false

  console.log("id_exist.....",id_exist)
  if (id_exist) {
    console.log("delete operation happens")
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  }
  else {
    console.log("delete is not possible, because ID doesn't exist")
    return response.status(400).json({ 
      error: `Unfourtunately ${persons.name} data already removed from server`
    })
  }
})

// User wants to list one person information from the phonebook
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id)
  const selected_person = persons.filter(person => person.id === id)
  console.log(selected_person.length)
  if (selected_person.length === 0) {
    response.status(404).end()
  }
  response.json(selected_person)
  return response.status(200).end()
})

// User wants to see all person information from the phonebook
app.get('/api/persons', (request, response) => {
  response.json(persons)
  return response.status(200).end()
});

// User moved to ./info web-page, and see a spefic return message
app.get('/api/info', (request, response) => {
    var elements_in_persons = (persons.map(count => count.id)).length
    response.send(`<p>${elements_in_persons} <br> <br> ${Date()}</p>`)
    return response.status(200).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})