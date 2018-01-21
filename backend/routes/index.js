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

/* GET presenter data */
router.get('/get-presenter-data', controller.getPresenterData)

/* POST presenter data */
router.post('/set-presenter-data', controller.setPresenterData)

/* GET display data */
router.get('/get-display-data', controller.getDisplayData)

/* POST display data */
router.post('/set-display-data', controller.setDisplayData)

module.exports = router
