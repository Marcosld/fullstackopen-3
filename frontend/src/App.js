import React, {useEffect, useState} from 'react'
import {add, getAll, remove, update} from './services/persons'
import './App.css'

const Filter = ({value, onUpdate}) =>
    <div>
        filter shown with <input value={value} onChange={onUpdate} />
    </div>

const PersonForm = ({onNewPerson}) => {
    const [ name, setName ] = useState('')
    const [ number, setNumber ] = useState('')

    const handlerInputName = e => setName(e.target.value)
    const handlerInputNumber = e => setNumber(e.target.value)
    const handlerForm = e => {
        e.preventDefault();
        onNewPerson({name, number})
        setName('')
        setNumber('')
    }

    return (
        <form onSubmit={handlerForm}>
            <div>
                name: <input value={name} onChange={handlerInputName}/>
            </div>
            <div>
                number: <input value={number} onChange={handlerInputNumber}/>
            </div>
            <div>
                <button type="submit">Add</button>
            </div>
        </form>
    )
}

const Person = ({name, number, onDelete}) =>
    <>
        <p>{name} {number}</p>
        <button onClick={onDelete}>delete</button>
    </>

const Persons = ({persons, filter, onDelete}) => persons
    .filter(({name}) => name.toUpperCase().includes(filter.toUpperCase()))
    .map(({name, number, id}) => <Person key={id} name={name} number={number} onDelete={() => onDelete(id, name)}/>)

const Notification = ({ notification }) => {
    if (!notification) {
        return null
    }

    return (
        <div className={notification.type}>
            {notification.message}
        </div>
    )
}

const App = () => {
    const [ persons, setPersons] = useState([])
    const [ filter, setFilter ] = useState('')
    const [ notification, setNotification ] = useState(null)

    useEffect(() => {
        getAll().then(persons => setPersons(persons))
    }, [])

    const handlerInputFilter = e => setFilter(e.target.value)
    const onNewPerson = ({name, number}) => {
        const existingPerson = persons.find(person => person.name === name)
        if (!existingPerson) {
            add({name, number}).then(person => {
                setPersons([...persons, person])
                setNotification({type: 'success', message: `Added ${person.name}!`})
                setTimeout(() => setNotification(null), 2000);
            })
        } else {
            onUpdatePerson({name, id: existingPerson.id, number})
        }
    }
    const onDeletePerson = (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
            remove(id).then(() => setPersons(persons.filter((person) => person.id !== id)))
        }
    }
    const onUpdatePerson = ({name, id, number}) => {
        if (window.confirm(`${name} is already on the phonebook. Update phone number?`)) {
            update(id, {name, number}).then(
                updatedPerson => {
                    setPersons(
                        persons.reduce(
                            (updatedPersons, person) => updatedPersons.concat(person.id !== updatedPerson.id ? person : updatedPerson)
                            , []
                        )
                    )
                    setNotification({type: 'success', message: `Updated ${name}!`})
                    setTimeout(() => setNotification(null), 2000);
                }
            ).catch(() => {
                setNotification({type: 'error', message: `Information of ${name} already deleted from server`})
            })
        }
    }

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification notification={notification}/>
            <Filter value={filter} onUpdate={handlerInputFilter}/>
            <h2>Add a new</h2>
            <PersonForm onNewPerson={onNewPerson}/>
            <h2>Numbers</h2>
            <Persons filter={filter} persons={persons} onDelete={onDeletePerson} />
        </div>
    )
}

export default App
