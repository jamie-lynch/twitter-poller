// utils
import React, { Component } from 'react'
import request from 'superagent'
import noCache from 'superagent-no-cache'

// components
import {
  Tweet,
  Counter,
  Loader,
  MainControls,
  ShortlistModal,
  ConfirmStartStopModal
} from '../../components'

class MainController extends Component {
  constructor(props) {
    super(props)

    this.setInitialState = this.setInitialState.bind(this)
    this.listen = this.listen.bind(this)
    this.startPoll = this.startPoll.bind(this)
    this.endPoll = this.endPoll.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.onIconClick = this.onIconClick.bind(this)
    this.clearTweetList = this.clearTweetList.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.sortAndFilter = this.sortAndFilter.bind(this)
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)

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
      shortlistModal: null,
      confirmAction: null
    }

    this.ws = null
  }

  componentDidMount() {
    this.setInitialState()
  }

  componentWillUnmount() {
    this.ws.close()
  }

  setInitialState() {
    request
      .get(`//${window.location.hostname}:3001/get-poll-data`)
      .use(noCache)
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
        this.ws = new window.WebSocket(`ws://${window.location.hostname}:3001`)
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
              displayTweets: [],
              loading: false
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
    this.setState({ confirmAction: null, loading: true })
    request
      .post(`//${window.location.hostname}:3001/start-poll`)
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
    this.setState({ confirmAction: null })
    request
      .post(`//${window.location.hostname}:3001/stop-poll`)
      .end((err, res) => {
        return
      })
  }

  confirm(action) {
    this.setState({ confirmAction: action })
  }

  cancel() {
    this.setState({ confirmAction: null })
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
        .post(`//${window.location.hostname}:3001/set-${icon}-data`)
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
        .post(`//${window.location.hostname}:3001/set-${list}-data`)
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
      <div className="header d-flex flex-column align-items-center mb-4 mt-3">
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
        <div className="container mb-5 pb-3">
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
                  onClick={() => this.confirm(this.state.buttonState)}
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
        <ConfirmStartStopModal
          open={!!this.state.confirmAction}
          toggle={this.cancel}
          action={this.state.confirmAction}
          confirm={
            this.state.confirmAction === 'Start' ? this.startPoll : this.endPoll
          }
        />
      </div>
    )
  }
}

export default MainController
