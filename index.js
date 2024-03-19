require("dotenv").config();

const express = require("express");
const app = express();
let morgan = require("morgan");
const cors = require("cors");
const Phonebook = require("./models/phonebook");

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
morgan.token("data", (req, res) => JSON.stringify(req.body));

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
    ].join(" ");
  })
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// const generateId = () => {
//   const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;

//   return maxId + 1;
// };

app.get("/api/persons", (req, res) => {
  Phonebook.find({}).then((result) => res.json(result));
});

app.get("/info", (req, res) => {
  Phonebook.find({}).then((contacts) =>
    res.send(
      `<div> Phonebook has info for ${
        contacts.length
      } people <p>${new Date().toString()}</p></div>`
    )
  );
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Phonebook.findById(id)
    .then((result) => {
      if (!result) {
        return res.status(404).send({ error: "Contact not found." });
      }

      res.json(result);
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Phonebook.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).send({ error: "Contact not found" });
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    res.status(400).json({ error: "Contact name and number is required." });
  }

  const contact = new Phonebook({
    name: body.name,
    number: body.number,
  });

  contact
    .save()
    .then((savedContact) => res.json(savedContact))
    .catch((err) => next(err));
  // const body = {
  //   ...req.body,
  //   id: generateId(),
  // };

  // const nameExist = persons.find((p) => p.name === body.name);

  // if (!body.name) {
  //   return res.status(400).send({
  //     error: "name is required",
  //   });
  // }

  // if (!body.number) {
  //   return res.status(400).send({
  //     error: "number is required",
  //   });
  // }

  // if (nameExist) {
  //   return res.status(400).send({
  //     error: "name already exists",
  //   });
  // }

  // persons = persons.concat(body);
  // res.json(body);
});

app.put("/api/persons/:id", (req, res, next) => {
  const data = {
    name: req.body.name,
    number: req.body.number,
  };
  Phonebook.findByIdAndUpdate(req.params.id, data, { new: true })
    .then((updatedContact) => {
      if (updatedContact) {
        res.json(updatedContact);
      } else {
        res.status(404).send({ error: "Contact not found" });
      }
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.log(err.message);

  if (err.name === "CastError") {
    res.status(500).send({ error: "Invalid Id" });
  }

  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
