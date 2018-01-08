var twitter = require('../utils/twitter')

exports.index = function(req, res, next) {
  res.render('index')
}

exports.getTweets = function(req, res, next) {
  let hashtag = req.query.hashtag
  twitter
    .getTweets(hashtag)
    .then(tweets => {
      return res.status(200).json(tweets)
    })
    .catch(err => {
      return res.status(500).json(err.message)
    })
}
