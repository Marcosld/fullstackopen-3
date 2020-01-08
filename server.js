const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors');
let persons = require('./resources/persons')
const PORT = process.env.PORT || 3001

const app = express();
const apiRouter = express.Router();
const personsRouter = express.Router();

app.use(cors())
app.use(bodyParser.json())
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
}))

app.use(express.static('build'))
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.get('/info', (_, res) =>
    res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
)

apiRouter.use('/persons', personsRouter)

personsRouter.route('/')
    .get((_, res) => res.json(persons))
    .post((req, res) => {
        const { name, number } = req.body;
        if (!name) {
            return res.status(400).json({error: 'name missing'})
        }
        if (!number) {
            return res.status(400).json({error: 'number missing'})
        }
        if (persons.find(person => name === person.name)) {
            return res.status(400).json({error: 'name already exists'})
        }
        const person = {
            name,
            number,
            id: Math.floor(Math.random() * 999999999)
        }
        persons.push(person)
        return res.json(person)
    })

personsRouter.route('/:id')
    .get(({params}, res) => {
        const person = persons.find(({id}) => id === parseInt(params.id))
        if (!person) {
            return res.status(404).json({ error: 'Resource doesnt exist'})
        }
        return res.json(person)
    })
    .delete(({params}, res) => {
        persons = persons.filter(({id}) => id !== parseInt(params.id))
        res.sendStatus(204)
    })
