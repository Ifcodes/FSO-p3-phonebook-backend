require("dotenv").config()

const express = require("express")
const app = express()
let morgan = require("morgan")
const cors = require("cors")

const Phonebook = require("./models/phonebook")

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "Unknown endpoint" })
}

const errorHandler = (err, req, res, next) => {
	console.log(err.message)

	if (err.name === "CastError") {
		res.status(400).send({ error: "Invalid Id" })
	} else if (err.name === "ValidationError") {
		res.status(400).send({ err: err.message })
	}

	next(err)
}

app.use(express.static("dist"))
app.use(express.json())
app.use(cors())
morgan.token("data", (req, ) => JSON.stringify(req.body))

app.use(
	morgan(function (tokens, req, res) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			tokens.data(req, res),
		].join(" ")
	})
)

app.get("/api/persons", (req, res) => {
	Phonebook.find({}).then((result) => res.json(result))
})

app.get("/info", (req, res) => {
	Phonebook.find({}).then((contacts) =>
		res.send(
			`<div> Phonebook has info for ${
				contacts.length
			} people <p>${new Date().toString()}</p></div>`
		)
	)
})

app.get("/api/persons/:id", (req, res, next) => {
	const id = req.params.id

	Phonebook.findById(id)
		.then((result) => {
			if (!result) {
				return res.status(404).send({ error: "Contact not found." })
			}

			res.json(result)
		})
		.catch((err) => next(err))
})

app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id
	Phonebook.findByIdAndDelete(id)
		.then((result) => {
			if (result) {
				res.status(204).end()
			} else {
				res.status(404).send({ error: "Contact not found" })
			}
		})
		.catch((err) => {
			next(err)
		})
})

app.post("/api/persons", (req, res, next) => {
	const body = req.body

	const contact = new Phonebook({
		name: body.name,
		number: body.number,
	})

	contact
		.save()
		.then((savedContact) => res.json(savedContact))
		.catch((err) => next(err))
})

app.put("/api/persons/:id", (req, res, next) => {
	const data = {
		name: req.body.name,
		number: req.body.number,
	}

	Phonebook.findByIdAndUpdate(req.params.id, data, {
		new: true,
		runValidators: true,
		context: "query",
	})
		.then((updatedContact) => {
			if (updatedContact) {
				res.json(updatedContact)
			} else {
				res.status(404).send({ error: "Contact not found" })
			}
		})
		.catch((err) => next(err))
})

app.use(unknownEndpoint)
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
	console.log("Server running on port " + PORT)
})
