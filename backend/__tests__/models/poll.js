var Poll = require('../../models/poll')
const mongoose = require('mongoose')

beforeAll(() => {
  mongoose.Promise = require('bluebird')
  mongoose
    .connect('mongodb://localhost:27017/twitter-poller', {
      useMongoClient: true
    })
    .catch(err => {
      console.error(err)
    })
})

describe('The create function', () => {
  beforeAll(() => {
    return Poll.remove({})
  })

  it('creates a new empty poll', () => {
    expect.assertions(2)
    return Poll.create()
      .then(poll => {
        expect(poll.id).toBeDefined()
        return Poll.find()
      })
      .then(polls => {
        expect(polls.length).toBe(1)
      })
  })
})

describe('The get function', () => {
  beforeAll(() => {
    return Poll.remove({}).then(() => {
      return Poll.create()
    })
  })

  it('responds with the poll', () => {
    expect.assertions(5)
    return Poll.get().then(poll => {
      expect(poll.active).toBe(false)
      expect(poll.leftCount).toBe(0)
      expect(poll.rightCount).toBe(0)
      expect(JSON.stringify(poll.leftTweets)).toEqual('[]')
      expect(JSON.stringify(poll.rightTweets)).toEqual('[]')
    })
  })
})

describe('The modify function', () => {
  beforeAll(() => {
    return Poll.remove({}).then(() => {
      return Poll.create()
    })
  })

  it('updates the item', () => {
    expect.assertions(8)
    return Poll.modify([{ id: 1 }], [{ id: 3 }, { id: 4 }])
      .then(() => {
        return Poll.find()
      })
      .then(polls => {
        let poll = polls[0]
        expect(poll.leftCount).toBe(1)
        expect(poll.rightCount).toBe(2)
        expect(JSON.stringify(poll.leftTweets)).toEqual(
          JSON.stringify([{ id: 1 }])
        )
        expect(JSON.stringify(poll.rightTweets)).toEqual(
          JSON.stringify([{ id: 3 }, { id: 4 }])
        )
        return Poll.modify([{ id: 5 }, { id: 7 }], [{ id: 9 }, { id: 12 }])
      })
      .then(() => {
        return Poll.find()
      })
      .then(polls => {
        let poll = polls[0]
        expect(poll.leftCount).toBe(3)
        expect(poll.rightCount).toBe(4)
        expect(JSON.stringify(poll.leftTweets)).toEqual(
          JSON.stringify([{ id: 1 }, { id: 5 }, { id: 7 }])
        )
        expect(JSON.stringify(poll.rightTweets)).toEqual(
          JSON.stringify([{ id: 3 }, { id: 4 }, { id: 9 }, { id: 12 }])
        )
      })
  })
})

describe('The start function', () => {
  beforeAll(() => {
    return Poll.remove({}).then(() => {
      return Poll.create()
    })
  })

  it('sets the active value to true', () => {
    expect.assertions(3)
    return Poll.start('hello', 'world')
      .then(() => {
        return Poll.find()
      })
      .then(polls => {
        expect(polls[0].active).toBe(true)
        expect(polls[0].leftHashtag).toBe('hello')
        expect(polls[0].rightHashtag).toBe('world')
      })
  })
})

describe('The stop function', () => {
  beforeAll(() => {
    return Poll.remove({})
      .then(() => {
        return Poll.create()
      })
      .then(poll => {
        return Poll.update({ _id: poll._id }, { active: true })
      })
  })

  it('sets the active value to true', () => {
    expect.assertions(1)
    return Poll.stop()
      .then(() => {
        return Poll.find()
      })
      .then(polls => {
        expect(polls[0].active).toBe(false)
      })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
