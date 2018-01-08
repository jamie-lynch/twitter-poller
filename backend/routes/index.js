var express = require('express')
var controller = require('../controllers')

var router = express.Router()

/* GET home page. */
router.get('/', controller.index)

/* GET test page */
router.get('/get-tweets', controller.getTweets)

module.exports = router
