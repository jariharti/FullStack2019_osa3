const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')


mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI


mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, unique: true },
  number: { type: String, minlength: 8 },
  id: String
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('persons', personSchema)