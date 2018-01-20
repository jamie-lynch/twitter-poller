// utils
import React, { Component } from 'react'
import request from 'superagent'

// components
import { Tweet, Counter, Loader } from '../../components'

class MainController extends Component {
  constructor(props) {
    super(props)

    this.setInitialState = this.setInitialState.bind(this)
    this.listen = this.listen.bind(this)
    this.startPoll = this.startPoll.bind(this)
    this.endPoll = this.endPoll.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.onIconClick = this.onIconClick.bind(this)
    this.sortAndFilter = this.sortAndFilter.bind(this)

    this.state = {
      // Available values: 'Start' | 'Stop'
      buttonState: 'Start',
      leftTweets: [],
      rightTweets: [],
      leftCount: 0,
      rightCount: 0,
      leftHashtag: '',
      rightHashtag: '',
      active: false,
      loading: true,
      tweetLists: {
        presenter: [],
        display: []
      }
    }
  }

  componentDidMount() {
    this.setInitialState()
  }

  setInitialState() {
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-poll-data`)
      .set({ 'Content-Type': 'application/json' })
      .end((err, res) => {
        let pres = res.body.presenterTweets.slice()

        let leftTweets = res.body.leftTweets.slice()
        leftTweets.forEach((tweet, index) => {
          if (
            pres.find(presTweet => {
              return presTweet.id === tweet.id
            })
          ) {
            leftTweets[index].presenter = true
          }
        })

        let rightTweets = res.body.rightTweets.slice()
        rightTweets.forEach((tweet, index) => {
          if (
            pres.find(presTweet => {
              return presTweet.id === tweet.id
            })
          ) {
            rightTweets[index].presenter = true
          }
        })

        this.setState({
          leftHashtag: res.body.leftHashtag,
          rightHashtag: res.body.rightHashtag,
          leftTweets: leftTweets,
          rightTweets: rightTweets,
          leftCount: res.body.leftCount,
          rightCount: res.body.rightCount,
          tweetLists: {
            presenter: pres,
            display: []
          },
          active: res.body.active,
          loading: false
        })
        this.ws = new window.WebSocket(
          `ws://${process.env.REACT_APP_BACKEND_API}`
        )
        this.listen(this.ws)
      })
  }

  listen(ws) {
    ws.onmessage = received => {
      var msg = JSON.parse(received.data)
      var { type, data } = msg

      if (type === 'main') {
        this.setState(prevState => {
          return {
            leftTweets: prevState.leftTweets.concat(data.newLeftTweets),
            rightTweets: prevState.rightTweets.concat(data.newRightTweets),
            leftCount: (prevState.leftCount += data.newLeftTweets.length),
            rightCount: (prevState.rightCount += data.newRightTweets.length)
          }
        })
      }
    }
  }

  startPoll() {
    request
      .post(`//${process.env.REACT_APP_BACKEND_API}/start-poll`)
      .set({ 'Content-Type': 'application/json' })
      .send({
        leftHashtag: this.state.leftHashtag,
        rightHashtag: this.state.rightHashtag
      })
      .end((err, res) => {
        return
      })
  }

  endPoll() {
    request
      .post(`//${process.env.REACT_APP_BACKEND_API}/stop-poll`)
      .end((err, res) => {
        return
      })
  }

  handleClick() {
    this.setState(prevState => {
      if (prevState.buttonState === 'Start') {
        this.startPoll()
        return {
          buttonState: 'Stop',
          active: true,
          leftTweets: [],
          rightTweets: [],
          leftCount: 0,
          rightCount: 0
        }
      } else {
        this.endPoll()
        return { buttonState: 'Start', active: false }
      }
    })
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  onIconClick(icon, id) {
    this.setState(prevState => {
      let left = true
      let index = prevState.leftTweets.findIndex(tweet => tweet.id === id)

      if (index < 0) {
        left = false
        index = prevState.rightTweets.findIndex(tweet => tweet.id === id)
      }

      let tweets = left ? prevState.leftTweets : prevState.rightTweets

      tweets[index][icon] = !tweets[index][icon]

      let returnVal = left ? 'leftTweets' : 'rightTweets'
      let returnObj = { [returnVal]: tweets }

      let subTweets = prevState.tweetLists[icon]
      if (tweets[index][icon]) {
        subTweets.push(tweets[index])
      } else {
        subTweets.splice(subTweets.findIndex(tweet => tweet.id === id), 1)
      }
      let tweetsList = Object.assign({}, prevState.tweetLists)
      tweetsList[icon] = subTweets
      returnObj.tweetsList = tweetsList

      request
        .post(`//${process.env.REACT_APP_BACKEND_API}/set-${icon}-data`)
        .set({ 'Content-Type': 'application/json' })
        .send({ tweets: subTweets })
        .end((err, res) => {
          return
        })

      return returnObj
    })
  }

  sortAndFilter() {
    let leftTweets = this.state.leftTweets.slice().reverse()
    let rightTweets = this.state.rightTweets.slice().reverse()
    return { leftTweets, rightTweets }
  }

  render() {
    var { leftTweets, rightTweets } = this.sortAndFilter()

    let header = (
      <div className="header d-flex flex-column align-items-center mb-4">
        <h1>Twitter Poller</h1>
        <p>Survey opinions by counting tweets</p>
      </div>
    )

    if (this.state.loading) {
      return (
        <div className="app">
          {header}
          <Loader />
        </div>
      )
    }
    return (
      <div className="MainController">
        {header}
        <div className="container">
          <div className="row">
            <div className="col-sm-5">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon1">
                    <i className="fas fa-hashtag" />
                  </span>
                </div>
                <input
                  type="text"
                  name="leftHashtag"
                  ref="leftHashtag"
                  className="form-control"
                  placeholder="hashtag"
                  aria-label="leftHashtag"
                  aria-describedby="basic-addon1"
                  onChange={this.handleChange}
                  value={this.state.leftHashtag}
                  disabled={this.state.buttonState === 'Stop'}
                />
              </div>
            </div>

            <div className="col-sm-2 d-flex flex-row justify-content-center">
              <div>
                <button
                  className="btn btn-primary m-auto"
                  disabled={
                    this.state.buttonState === 'Start' &&
                    (!this.state.leftHashtag || !this.state.rightHashtag)
                  }
                  onClick={this.handleClick}
                >
                  {this.state.buttonState}
                </button>
              </div>
            </div>

            <div className="col-sm-5">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon1">
                    <i className="fas fa-hashtag" />
                  </span>
                </div>
                <input
                  type="text"
                  name="rightHashtag"
                  ref="rightHashtag"
                  className="form-control"
                  placeholder="hashtag"
                  aria-label="rightHashtag"
                  aria-describedby="basic-addon1"
                  value={this.state.rightHashtag}
                  onChange={this.handleChange}
                  disabled={this.state.buttonState === 'Stop'}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-5">
              <Counter count={this.state.leftCount} />
            </div>
            <div className="col-sm-2" />
            <div className="col-sm-5">
              <Counter count={this.state.rightCount} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-5">
              {leftTweets.map(tweet => {
                return (
                  <Tweet
                    key={tweet.id}
                    data={tweet}
                    onIconClick={this.onIconClick}
                    control
                  />
                )
              })}
            </div>
            <div className="col-sm-2" />
            <div className="col-sm-5">
              {rightTweets.map(tweet => {
                return (
                  <Tweet
                    key={tweet.id}
                    data={tweet}
                    onIconClick={this.onIconClick}
                    control
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MainController
