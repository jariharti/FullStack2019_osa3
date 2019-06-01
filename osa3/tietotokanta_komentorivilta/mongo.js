/* Jari Hartikainen, 29.5.2019 */
/* Aalto University, Course: Full Stack Web Development, Part 3: Tietokanta komentoriviltä step1 ... step1*/

const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
    `mongodb+srv://fullstack_JH:${password}@cluster0-gbbel.mongodb.net/phonebook-app?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true })

const personsSchema = new mongoose.Schema({
        name: String,
        number: String
    }
)
const Persons = mongoose.model('Persons', personsSchema)

console.log("argumenttien määrä",process.argv.length)

if (process.argv.length > 3) {
    console.log(`lisätään ${name} numero ${number} luetteloon`)

    const  persons = new Persons({
            name: `${name}`,
            number: `${number}`,
        })


    // insert single document //
    persons.save().then(response => {
    console.log('persons saved!');
    mongoose.connection.close();
    })
}
else {
    // get all documents from database //
    Persons.find({}).then(result => {
        console.log("puhelinluettelo:")
        result.forEach(persons => {
        console.log(persons.name, persons.number)
    })
    mongoose.connection.close()
    })
}

// insert many documents //
/*var persons = [
{
    name: "Arto Hellas",
    number: "040-123456"
},
{
    name: "Martti Tienari",
    number: "040-123456"
},
{
    name: "Arto Järvinen",
    number: "040-123456"
},
{
    name: "Lea Kutvonen",
    number: "040-123456"
}
]

Persons.collection.insertMany(persons).then(response => {
console.log('persons saved!');
mongoose.connection.close();
})*/