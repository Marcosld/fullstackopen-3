import axios from 'axios'

const resource = 'http://localhost:3001/api/persons'

export const getAll = () => axios.get(resource)
    .then(({data}) => data)

export const add = person => axios.post(resource, person)
    .then(({data}) => data)

export const remove = id => axios.delete(`${resource}/${id}`)

export const update = (id, person) => axios.put(`${resource}/${id}`, person)
    .then(({data}) => data)
