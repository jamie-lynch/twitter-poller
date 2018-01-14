var twitter = require('./twitter')

var poller
var stop = false

const startPoll = (leftHashtag, rightHashtag) => {
  return new Promise((resolve, reject) => {
    poller = {
      left: {
        hashtag: leftHashtag,
        since: null,
        tweets: [],
        count: 0
      },
      right: {
        hashtag: rightHashtag,
        since: null,
        tweets: [],
        count: 0
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

        setTimeout(() => {
          poll()
        }, 5000)
        return resolve()
      })
      .catch(err => {
        return reject(err)
      })
  })
}

const stopPoll = () => {
  stop = true
}

const getPollData = (tweets = false) => {
  var data = {
    leftCount: poller.left.count || 0,
    rightCount: poller.right.count || 0
  }
  if (tweets) {
    data.leftTweets = poller.left.tweets
    data.rightTweets = poller.right.tweets
  }

  return data
}

const sortAscendingOnId = (a, b) => {
  return a.id - b.id
}

const processTweets = (tweets, left = true) => {
  // If there haven't been any tweets then just return
  if (!tweets.statuses.length) {
    return
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
    data.count += tweets.statuses.length
    data.tweets = data.tweets.concat(tweets.statuses)
    data.since = statuses[statuses.length - 1].id
    left ? (poller.left = data) : (poller.right = data)
  }
}

const poll = () => {
  if (stop) {
    return
  }
  return fetchData(poller.left.hashtag, poller.left.since)
    .then(tweets => {
      processTweets(tweets, true)
      return fetchData(poller.right.hashtag, poller.right.since)
    })
    .then(tweets => {
      processTweets(tweets, false)
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
  getPollData,
  sortAscendingOnId,
  processTweets,
  poll,
  fetchData
}
