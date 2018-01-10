var Twitter = require('twitter')

var client

exports.createTwitterClient = function(server) {
  client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  })
}

/**
 * This function returns a selection of tweets matching the hashtag provided
 * @param  {string} hashtag A hashtag to search for, without the leading #
 * @return {array}         An array of tweets in the format described at https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
 */
exports.getTweets = function(hashtag, since_id = null) {
  return new Promise((resolve, reject) => {
    let options = { q: `#${hashtag}`, result_type: 'recent', count: 100 }
    if (since_id) {
      options.since_id = since_id
    }

    client
      .get('search/tweets', options)
      .then(tweets => {
        return resolve(tweets)
      })
      .catch(err => {
        return reject(err)
      })
  })
}
