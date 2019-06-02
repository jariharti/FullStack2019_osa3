/* Jari Hartikainen, 30.5.2019 */
/* Aalto University, Course: Full Stack Web Development, Part 3: puhelinluettelo ja tietokanta step1 ... step8*/

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const logger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
//Express tarkastaa GET-tyyppisten HTTP-pyyntöjen yhteydessä ensin löytyykö pyynnön polkua vastaavan nimistä tiedostoa hakemistosta build //
//Jos löytyy, palauttaa express tiedoston //
app.use(express.static('build'))

// Koska palvelin on localhostin portissa 3001 ja frontend localhostin portissa 3000, niiden origin ei ole sama //
// Voimme sallia muista origineista tulevat pyynnöt käyttämällä Noden cors-middlewarea. //
app.use(cors())
app.use(bodyParser.json())
app.use(logger)

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

// get phonebook data from Mongo database in collections "persons", when user enters to ./ web-page //
app.get('/', (request, response, next) => {
  Person.find({}).then(list=> {
    response.json(list.map(person => person.toJSON()))
  })
  .catch(error => next(error))
})

// get phonebook data from Mongo database in collections "persons", when user enters to ./api/persons web-page //
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(list => {
    response.json(list.map(person => person.toJSON()))
  })
  .catch(error => next(error))
})

// User wants to add a new person to Mongo database collection "persons"
app.post('/api/persons', (request,response, next) => {
  const body = request.body
  if (body.name === "") {
    response.status(400).json({ error: 'content missing' }).end()
  }
  else {
    const person = new Person({
      name: body.name,
      number: body.number || false,
    })

    person.save()
      .then(savedPerson => {
        console.log("savedPerson....",savedPerson)
        response.json(savedPerson.toJSON())
      })
      .catch(error => {
        console.log("error in savedPerson....",error)
        next(error)
      })
  }
})

// User wants to delete person from the phonebook
app.delete('/api/persons/:id', (request, response, next) => {
Person.findByIdAndRemove(request.params.id)
    .then(result => {
      if (result==null) {
        response.status(400).json({ error: 'Data already removed' }).end()
      }
      else {
        response.status(204).end()
      }
    })
  .catch(
    error => next(error)
  )
})

// User wants to list one person information from the phonebook
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
     if (person) {
        response.json(person.toJSON())
        } else {
        response.status(404).end() 
      }
    })
    .catch(error => {
      next(error)
    })

})

// User wants to update persons' phone number only 
app.put('/api/persons/:id', (request, response, next) => {

  const newNumber = {
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id, newNumber)
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})


// User moved to ./info web-page, and see a spefic return message
app.get('/api/info', (request, response, next) => {

  Person.find({}).then (
    results => {
    var collectionElements = results.map(count => count.id).length
    response.send(`<p>&nbsp;Puhelinluettelossa ${collectionElements} henkilön tiedot<br> <br>&nbsp; ${Date()}</p>`)
    response.status(204).end()
    })
  .catch(error => next(error)
  )
})

const errorHandler = (error, request, response, next) => {
  console.log("error.name in errorHandler",error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }



  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})