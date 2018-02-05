# Twitter Poller

Survey opinion by counting hashtags

## Useful Links

Github - https://github.com/jamie-lynch/twitter-poller

Trello - https://trello.com/b/4qcsRRIe/twitter-poller

## Technology

The app consists of separate backend and frontend servers, both based in node.js.
The backend server uses express, and is built upon express-generator, whilst the
frontend is built using React, built upon create-react-app.

## Installation

The app can be run in two different ways, either using docker or a package manager.

**Using docker**

This process will required docker to be installed on the machine.

Clone the repository

```
git clone https://github.com/jamie-lynch/twitter-poller
```

Setup environment variables (insert address as appropriate )
Note that the actual ip address of the machine must be used. localhost will not work as the database is run in a separate container

```
# backend/.env

# Twitter Access (twitter access tokens, see https://developer.twitter.com/en/docs/basics/authentication/overview/oauth)
CONSUMER_KEY=
CONSUMER_SECRET=
BEARER_TOKEN=

# Database
DB_ADDRESS="mongodb://127.0.0.1:27017/twitter-poller"

# Poll Rate (number of ms between requests to twitter)
POLL_RATE=30000
```

Run docker containers

```
docker-compose up -d
```

**Using npm / yarn**

This process will require node.js and npm and/or yarn to be installed on your machine. You will also need a running intace of mongodb.

Clone the repository

```
git clone https://github.com/jamie-lynch/twitter-poller
```

Setup environment variables (insert address as appropriate )
Note that the actual ip address of the machine must be used. localhost will not work as the database is run in a separate container

```
# backend/.env

# Twitter Access (twitter access tokens, see https://developer.twitter.com/en/docs/basics/authentication/overview/oauth)
CONSUMER_KEY=
CONSUMER_SECRET=
BEARER_TOKEN=

# Database
DB_ADDRESS="mongodb://127.0.0.1:27017/twitter-poller"

# Poll Rate (number of ms between requests to twitter)
POLL_RATE=30000
```

Run the backend

```
cd backend && yarn install && yarn start

or

cd backend && npm i && npm start
```

Run the frontend

```
cd frontend && yarn install && yarn start

or

cd frontend && npm i && npm start
```
