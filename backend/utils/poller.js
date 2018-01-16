var twitter = require('./twitter')
var Poll = require('../models/poll')
var wss = require('./websockets')

var poller
var stop = true

const startPoll = (leftHashtag, rightHashtag) => {
  return new Promise((resolve, reject) => {
    poller = {
      left: {
        hashtag: leftHashtag,
        since: null
      },
      right: {
        hashtag: rightHashtag,
        since: null
      }
    }

    twitter
      .getTweets(poller.left.hashtag)
      .then(tweets => {
        let statuses = tweets.statuses
        if (statuses.length) {
          statuses.sort(sortAscendingOnId)
          poller.left.since = statuses[statuses.length - 1].id
        }
        return twitter.getTweets(poller.right.hashtag)
      })
      .then(tweets => {
        let statuses = tweets.statuses
        if (statuses.length) {
          statuses.sort(sortAscendingOnId)
          poller.right.since = statuses[statuses.length - 1].id
        }

        return Poll.start(leftHashtag, rightHashtag)
      })
      .then(() => {
        setTimeout(() => {
          poll()
        }, 5000)
        stop = false
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

const stopPoll = () => {
  stop = true
  return Poll.stop()
}

const sortAscendingOnId = (a, b) => {
  return a.id - b.id
}

const processTweets = (tweets, left = true) => {
  // If there haven't been any tweets then just return
  if (!tweets.statuses.length) {
    return []
  }

  // Sort the tweets in ascending order based on id
  let statuses = tweets.statuses
  statuses.sort(sortAscendingOnId)

  // Take a copy of the data for the relevant side
  let data = Object.assign({}, left ? poller.left : poller.right)

  // If a tweet matching the since id is found, then remove it
  if (statuses[0].id === data.since) {
    statuses.splice(0, 1)
  }

  // If there are still some tweets then process the data
  if (statuses.length) {
    data.since = statuses[statuses.length - 1].id
    left ? (poller.left = data) : (poller.right = data)
    return statuses
  }
  return []
}

const poll = () => {
  if (stop) {
    return
  }

  var left = []
  var right = []
  return fetchData(poller.left.hashtag, poller.left.since)
    .then(tweets => {
      left = processTweets(tweets, true)
      return fetchData(poller.right.hashtag, poller.right.since)
    })
    .then(tweets => {
      right = processTweets(tweets, false)
      wss.broadcastChange('main', {
        newLeftTweets: left,
        newRightTweets: right
      })
      return Poll.addTweets(left, right)
    })
    .then(() => {
      setTimeout(() => {
        poll()
      }, 10000)
      return
    })
    .catch(err => {
      console.error(err.message)
    })
}

const fetchData = (hashtag, since) => {
  let statuses = []

  var getPage = (hashtag = null, since = null, next_results = null) => {
    return twitter.getTweets(hashtag, since, next_results).then(tweets => {
      statuses = statuses.concat(tweets.statuses)
      if (tweets.search_metadata.next_results) {
        return getPage(null, since, tweets.search_metadata.next_results)
      } else {
        return { statuses, search_metadata: tweets.search_metadata }
      }
    })
  }

  return getPage(hashtag, since)
}

module.exports = {
  startPoll,
  stopPoll,
  sortAscendingOnId,
  processTweets,
  poll,
  fetchData
}
