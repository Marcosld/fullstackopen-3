require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors');
const Person = require('./models/person')
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
    Person.find({}).then(persons =>
        res.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
        `)
    )
)

apiRouter.use('/persons', personsRouter)

personsRouter.route('/')
    .get(
        (_, res) => Person.find({}).then(persons => res.json(persons))
    )
    .post((req, res, next) => {
        const { name, number } = req.body;
        if (!name) {
            return res.status(400).json({error: 'name missing'})
        }
        if (!number) {
            return res.status(400).json({error: 'number missing'})
        }
        new Person({ name, number })
            .save()
            .then(person => res.json(person))
            .catch(next)
    })

personsRouter.route('/:id')
    .get(({params}, res, next) =>
        Person.findById(params.id)
            .then(person => {
                if (!person) {
                    return res.status(404).json({ error: 'Resource doesnt exist'});
                }
                return res.json(person)
            })
            .catch(next)
    )
    .put(({params, body}, res, next) => {
        Person.findByIdAndUpdate(params.id, body, { new: true })
            .then(updatedPerson => res.json(updatedPerson))
            .catch(next)
    })
    .delete(({params}, res, next) =>
        Person.findByIdAndRemove(params.id)
            .then(() => res.sendStatus(204))
            .catch(next)
    )

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)