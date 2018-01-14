var poller = require('../utils/poller')
var Poll = require('../models/poll')

exports.index = function(req, res, next) {
  res.render('index')
}

exports.getPollData = function(req, res, next) {
  Poll.get().then(poll => {
    return res.status(200).json(poll)
  })
}

exports.startPoll = function(req, res, next) {
  poller
    .startPoll(req.body.leftHashtag, req.body.rightHashtag)
    .then(() => {
      return res.status(200).json({ success: true })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
}

exports.stopPoll = function(req, res, next) {
  poller.stopPoll().then(() => {
    return res.status(200).json({ success: true })
  })
}
