import axios from 'axios'
const baseUrl = 'https://covidtracking.com/api/v1/states/current.json'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}


export default {getAll}