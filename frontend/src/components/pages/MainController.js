// utils
import React, { Component } from 'react'
import request from 'superagent'

// components
import {
  Tweet,
  Counter,
  Loader,
  MainControls,
  ShortlistModal
} from '../../components'

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
    this.clearTweetList = this.clearTweetList.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
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
      presenterTweets: [],
      displayTweets: [],
      shortlistModal: null
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
        let display = res.body.displayTweets.slice()

        let leftTweets = res.body.leftTweets.slice()
        leftTweets.forEach((tweet, index) => {
          if (
            pres.find(presTweet => {
              return presTweet.id === tweet.id
            })
          ) {
            leftTweets[index].presenter = true
          }
          if (
            display.find(displayTweet => {
              return displayTweet.id === tweet.id
            })
          ) {
            leftTweets[index].display = true
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
          if (
            display.find(displayTweet => {
              return displayTweet.id === tweet.id
            })
          ) {
            rightTweets[index].display = true
          }
        })

        this.setState({
          buttonState: res.body.active ? 'Stop' : 'Start',
          leftHashtag: res.body.leftHashtag,
          rightHashtag: res.body.rightHashtag,
          leftTweets: leftTweets,
          rightTweets: rightTweets,
          leftCount: res.body.leftCount,
          rightCount: res.body.rightCount,
          presenterTweets: pres,
          displayTweets: display,
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

      switch (type) {
        case 'main':
          this.setState(prevState => {
            return {
              leftTweets: prevState.leftTweets.concat(data.newLeftTweets),
              rightTweets: prevState.rightTweets.concat(data.newRightTweets),
              leftCount: (prevState.leftCount += data.newLeftTweets.length),
              rightCount: (prevState.rightCount += data.newRightTweets.length)
            }
          })
          break
        case 'presenter':
          this.setState(prevState => {
            let leftTweets = prevState.leftTweets.slice()
            leftTweets.forEach((tweet, index) => {
              if (
                data.find(presTweet => {
                  return presTweet.id === tweet.id
                })
              ) {
                leftTweets[index].presenter = true
              } else {
                leftTweets[index].presenter = false
              }
            })

            let rightTweets = prevState.rightTweets.slice()
            rightTweets.forEach((tweet, index) => {
              if (
                data.find(presTweet => {
                  return presTweet.id === tweet.id
                })
              ) {
                rightTweets[index].presenter = true
              } else {
                rightTweets[index].presenter = false
              }
            })
            return {
              presenterTweets: data,
              leftTweets,
              rightTweets
            }
          })
          break
        case 'display':
          this.setState(prevState => {
            let leftTweets = prevState.leftTweets.slice()
            leftTweets.forEach((tweet, index) => {
              if (
                data.find(displayTweet => {
                  return displayTweet.id === tweet.id
                })
              ) {
                leftTweets[index].display = true
              } else {
                leftTweets[index].display = false
              }
            })

            let rightTweets = prevState.rightTweets.slice()
            rightTweets.forEach((tweet, index) => {
              if (
                data.find(displayTweet => {
                  return displayTweet.id === tweet.id
                })
              ) {
                rightTweets[index].display = true
              } else {
                rightTweets[index].display = false
              }
            })
            return {
              displayTweets: data,
              leftTweets,
              rightTweets
            }
          })
          break
        case 'start-stop':
          if (data.active) {
            this.setState({
              leftTweets: [],
              rightTweets: [],
              leftHashtag: data.leftHashtag,
              rightHashtag: data.rightHashtag,
              leftCount: 0,
              rightCount: 0,
              active: true,
              buttonState: 'Stop',
              presenterTweets: [],
              displayTweets: []
            })
          } else {
            this.setState({ active: false, buttonState: 'Start' })
          }
          break
        default:
          break
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
          rightCount: 0,
          presenterTweets: [],
          displayTweets: []
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

      let subTweets = prevState[`${icon}Tweets`]
      if (tweets[index][icon]) {
        subTweets.push(tweets[index])
      } else {
        subTweets.splice(subTweets.findIndex(tweet => tweet.id === id), 1)
      }
      returnObj[`${icon}Tweets`] = subTweets

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

  clearTweetList(list) {
    this.setState(prevState => {
      let leftTweets = prevState.leftTweets.slice()
      let rightTweets = prevState.rightTweets.slice()

      leftTweets.forEach(tweet => {
        tweet[list] = false
      })

      rightTweets.forEach(tweet => {
        tweet[list] = false
      })

      let tweetLists = Object.assign({}, prevState.tweetLists)
      tweetLists[list] = []

      request
        .post(`//${process.env.REACT_APP_BACKEND_API}/set-${list}-data`)
        .set({ 'Content-Type': 'application/json' })
        .send({ tweets: [] })
        .end((err, res) => {
          return
        })

      return { leftTweets, rightTweets, tweetLists, shortlistModal: null }
    })
  }

  toggleModal(shortlist) {
    this.setState(prevState => {
      return {
        shortlistModal:
          prevState.shortlistModal === shortlist ? null : shortlist
      }
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

            <div className="col-sm-2 d-flex flex-row justify-content-center mb-3">
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
                    control="main"
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
                    control="main"
                  />
                )
              })}
            </div>
          </div>
        </div>
        <MainControls onControlClick={this.toggleModal} />
        <ShortlistModal
          open={this.state.shortlistModal === 'presenter'}
          toggle={() => this.toggleModal('presenter')}
          shortlist="presenter"
          tweets={this.state.presenterTweets}
          onIconClick={this.onIconClick}
          clear={this.clearTweetList}
        />
        <ShortlistModal
          open={this.state.shortlistModal === 'display'}
          toggle={() => this.toggleModal('display')}
          shortlist="display"
          tweets={this.state.displayTweets}
          onIconClick={this.onIconClick}
          clear={this.clearTweetList}
        />
      </div>
    )
  }
}

export default MainController
