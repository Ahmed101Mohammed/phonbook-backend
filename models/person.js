const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
    .then(()=> console.log("Successfully connection to the DB"))
    .catch((e)=> console.log("Faild to connect to the DB: ", e))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: function(v)
            {
                return /^\d{3,4}-\d+$/.test(v)
            },
            message: props => `${props.value} in not a valid phone number!`
        }
    }
}, {versionKey: false})

personSchema.set("toJSON", {
    transform: (document, returnedValue)=>
    {
        returnedValue.id = returnedValue._id
        delete returnedValue._id
        delete returnedValue.__v
    }
})

const Person = mongoose.model('person', personSchema)
module.exports = Person