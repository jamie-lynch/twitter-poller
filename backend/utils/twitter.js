var Twitter = require('twitter')

var client

exports.createTwitterClient = function(server) {
  client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    bearer_token: process.env.BEARER_TOKEN
  })
}

/**
 * This function returns a selection of tweets matching the hashtag provided
 * @param  {string} hashtag A hashtag to search for, without the leading #
 * @return {array}         An array of tweets in the format described at https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
 */
exports.getTweets = function(hashtag, since_id = null, next_results = null) {
  return new Promise((resolve, reject) => {
    let path = 'search/tweets'
    let options = { q: `#${hashtag}`, result_type: 'recent', count: 100 }
    if (since_id) {
      options.since_id = since_id
    }

    if (next_results) {
      path = path
      ;(options = splitNextResults(next_results)), (options.since_id = since_id)
    }

    client
      .get(path, options)
      .then(tweets => {
        return resolve(tweets)
      })
      .catch(err => {
        return reject(err)
      })
  })
}

const splitNextResults = next_results => {
  let options = {}

  // Remove the leading ?
  if (next_results.charAt(0) === '?') {
    next_results = next_results.slice(1)
  }

  var pairs = next_results.split('&')
  for (i in pairs) {
    var split = pairs[i].split('=')
    options[decodeURIComponent(split[0])] = decodeURIComponent(split[1])
  }

  return options
}
