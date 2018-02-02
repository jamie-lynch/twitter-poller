require('dotenv').config()
const fetch = require('node-fetch')

let key = process.env.CONSUMER_KEY
let secret = process.env.CONSUMER_SECRET

key = encodeURIComponent(key)
secret = encodeURIComponent(secret)

let string = key + ':' + secret
string = new Buffer(string).toString('base64')

fetch('https://api.twitter.com/oauth2/token', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${string}`,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
  body: 'grant_type=client_credentials'
})
  .then(response => {
    return response.text()
  })
  .then(response => {
    console.log(response)
  })
