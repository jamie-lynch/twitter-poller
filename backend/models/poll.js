var mongoose = require('mongoose')
var Schema = mongoose.Schema

var pollSchema = new Schema({
  leftHashtag: { type: String, default: '', maxlength: 255 },
  rightHashtag: { type: String, default: '', maxlength: 255 },
  leftCount: { type: Number, default: 0 },
  rightCount: { type: Number, default: 0 },
  leftTweets: {
    type: [],
    default: []
  },
  rightTweets: {
    type: [],
    default: []
  },
  presenterTweets: {
    type: [],
    default: []
  },
  active: { type: Boolean, default: false }
})

pollSchema.statics.create = () => {
  return new Promise((resolve, reject) => {
    var poll = new Poll({})

    poll
      .save()
      .then(savedPoll => {
        return resolve(savedPoll)
      })
      .catch(err => {
        return reject(err)
      })
  })
}

pollSchema.statics.get = (tweets = false) => {
  return new Promise((resolve, reject) => {
    Poll.find()
      .then(polls => {
        return resolve(polls[0])
      })
      .catch(err => {
        return reject(err)
      })
  })
}

pollSchema.statics.getPresenterData = () => {
  return new Promise((resolve, reject) => {
    Poll.find({}, { leftTweets: 0, rightTweets: 0 }).then(polls => {
      return resolve(polls[0])
    })
  })
}

pollSchema.statics.addTweets = (newLeftTweets, newRightTweets) => {
  return new Promise((resolve, reject) => {
    Poll.find({}, { id: 1 })
      .then(polls => {
        let id = polls[0].id
        return Poll.update({
          $push: {
            leftTweets: { $each: newLeftTweets },
            rightTweets: { $each: newRightTweets }
          },
          $inc: {
            leftCount: newLeftTweets.length,
            rightCount: newRightTweets.length
          }
        })
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

pollSchema.statics.setPresenterTweets = tweets => {
  return new Promise((resolve, reject) => {
    Poll.find({}, { id: 1 })
      .then(polls => {
        let id = polls[0].id
        return Poll.update({
          presenterTweets: tweets
        })
      })
      .then(() => {
        return resolve()
      })
      .catch(() => {
        return reject()
      })
  })
}

pollSchema.statics.start = (leftHashtag, rightHashtag) => {
  return new Promise((resolve, reject) => {
    Poll.find()
      .then(polls => {
        return Poll.update(
          { _id: polls[0]._id },
          { active: true, leftHashtag, rightHashtag }
        )
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

pollSchema.statics.stop = () => {
  return new Promise((resolve, reject) => {
    Poll.find()
      .then(polls => {
        return Poll.update({ _id: polls[0]._id }, { active: false })
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

pollSchema.statics.removeAll = () => {
  return new Promise((resolve, reject) => {
    Poll.remove({})
      .then(() => {
        resolve()
      })
      .catch(err => {
        reject(err)
      })
  })
}

var Poll = mongoose.model('Poll', pollSchema)

module.exports = Poll
