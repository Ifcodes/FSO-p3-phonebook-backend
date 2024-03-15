const express = require("express");
const app = express();
let morgan = require("morgan");
const cors = require("cors");

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

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;

  return maxId + 1;
};

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    `<div> Phonebook has info for ${
      persons.length
    } people <p>${new Date().toString()}</p></div>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  if (!person) {
    return res.status(404).send({
      error: "person not found",
    });
  }

  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = {
    ...req.body,
    id: generateId(),
  };

  const nameExist = persons.find((p) => p.name === body.name);

  if (!body.name) {
    return res.status(400).send({
      error: "name is required",
    });
  }

  if (!body.number) {
    return res.status(400).send({
      error: "number is required",
    });
  }

  if (nameExist) {
    return res.status(400).send({
      error: "name already exists",
    });
  }

  persons = persons.concat(body);
  res.json(body);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
