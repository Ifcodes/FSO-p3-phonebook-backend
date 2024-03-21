const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URL

mongoose
	.connect(url)
	.then(() => {
		console.log("Connection to database established")
	})
	.catch((err) => console.log("Error connecting to database: ", err.message))

const phonebookSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Contact name is required"],
		minLength: [3, "Contact name must be more than 3 characters"],
	},
	number: {
		type: String,
		required: [true, "Contact number is required"],
		minLength: [9, "Contact number must be at least 8 digits"],
		validate: {
			validator: (v) => /\d{2,3}-\d{5,6}/.test(v),
		},
		message: (props) => `${props.value} is not a valid phone number`,
	},
})

mongoose.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

module.exports = new mongoose.model("Contact", phonebookSchema)
