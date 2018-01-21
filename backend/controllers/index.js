var poller = require('../utils/poller')
var Poll = require('../models/poll')
var wss = require('../utils/websockets')

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
      let wsMessage = {
        leftHashtag: req.body.leftHashtag,
        rightHashtag: req.body.rightHashtag,
        active: true
      }
      wss.broadcastChange('start-stop', wsMessage)
      return res.status(200).json({ success: true })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
}

exports.stopPoll = function(req, res, next) {
  poller.stopPoll().then(() => {
    wss.broadcastChange('start-stop', { active: false })
    return res.status(200).json({ success: true })
  })
}

exports.getPresenterData = function(req, res, next) {
  Poll.getPresenterData().then(data => {
    return res.status(200).json(Object.assign(data, { success: true }))
  })
}

exports.setPresenterData = function(req, res, next) {
  Poll.setPresenterTweets(req.body.tweets).then(() => {
    wss.broadcastChange('presenter', req.body.tweets)
    return res.status(200).json({ success: true })
  })
}

exports.getDisplayData = function(req, res, next) {
  Poll.getDisplayData().then(data => {
    return res.status(200).json(Object.assign(data, { success: true }))
  })
}

exports.setDisplayData = function(req, res, next) {
  Poll.setDisplayTweets(req.body.tweets).then(() => {
    wss.broadcastChange('display', req.body.tweets)
    return res.status(200).json({ success: true })
  })
}
