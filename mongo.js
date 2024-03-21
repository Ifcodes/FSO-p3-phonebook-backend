const mongoose = require("mongoose")

if (process.argv.length < 3) {
	console.log("Please provide password")
	process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://bernarddesmond16:${password}@cluster0.f52pck0.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const phonebookSchema = mongoose.Schema({
	name: String,
	number: String,
})

const Contact = mongoose.model("Contact", phonebookSchema)

const contact = new Contact({
	name: process.argv[3],
	number: process.argv[4],
})

if (process.argv.length === 4) {
	console.log("Please include phone number")
	process.exit(1)
}

if (process.argv.length === 5) {
	contact.save().then((result) => {
		console.log(`added ${result.name} number ${result.number} to phonebook`)
		mongoose.connection.close()
		process.exit(1)
	})
}

Contact.find({}).then((result) => {
	console.log("Phonebook:")
	result.forEach((contact) => {
		console.log(`${contact.name} ${contact.number}`)
	})
	mongoose.connection.close()
})
