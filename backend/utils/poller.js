var twitter = require('./twitter')

var poller

exports.startPoll = (leftHashtag, rightHashtag) => {
  return new Promise((resolve, reject) => {
    poller = {
      leftHashtag,
      rightHashtag,
      leftSince: null,
      rightSince: null,
      leftTweets: [],
      rightTweets: [],
      leftCount: null,
      rightCount: null,
      interval: null
    }

    twitter
      .getTweets(poller.leftHashtag)
      .then(tweets => {
        poller.leftSince = tweets.statuses[0].id
        return twitter.getTweets(poller.rightHashtag)
      })
      .then(tweets => {
        poller.rightSince = tweets.statuses[0].id
        poller.interval = setInterval(() => {
          poll()
        }, 10000)
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

exports.stopPoll = () => {
  clearInterval(poller.interval)
  poller.interval = null
}

exports.getPollData = (tweets = false) => {
  var data = {
    leftCount: poller.leftCount || 0,
    rightCount: poller.rightCount || 0
  }
  if (tweets) {
    data.leftTweets = poller.leftTweets
    data.rightTweets = poller.rightTweets
  }

  return data
}

var poll = () => {
  twitter
    .getTweets(poller.leftHashtag, poller.leftSince)
    .then(tweets => {
      if (!tweets.statuses.length) {
        return twitter.getTweets(poller.rightHashtag, poller.rightSince)
      }

      if (tweets.statuses[tweets.statuses.length - 1].id === poller.leftSince) {
        tweets.statuses.splice(-1, 1)
      }
      if (tweets.statuses.length) {
        poller.leftCount += tweets.statuses.length
        poller.leftTweets = poller.leftTweets.concat(tweets.statuses)
        poller.leftSince = tweets.statuses[0].id
      }
      return twitter.getTweets(poller.rightHashtag, poller.rightSince)
    })
    .then(tweets => {
      if (!tweets.statuses.length) {
        return
      }

      if (
        tweets.statuses[tweets.statuses.length - 1].id === poller.rightSince
      ) {
        tweets.statuses.splice(-1, 1)
      }

      if (tweets.statuses.length) {
        poller.rightCount += tweets.statuses.length
        poller.rightTweets = poller.rightTweets.concat(tweets.statuses)
        poller.rightSince = tweets.statuses[0].id
      }
      return
    })
    .catch(err => {
      console.error(err.message)
    })
}
