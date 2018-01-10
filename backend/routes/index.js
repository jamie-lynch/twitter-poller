var express = require('express')
var controller = require('../controllers')

var router = express.Router()

/* GET home page. */
router.get('/', controller.index)

/* GET current count */
router.get('/get-poll-data', controller.getPollData)

/* POST start a poll */
router.post('/start-poll', controller.startPoll)

/* POST stop a poll */
router.post('/stop-poll', controller.stopPoll)

module.exports = router
