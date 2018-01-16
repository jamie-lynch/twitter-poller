// utils
import React, { Component } from 'react'
import request from 'superagent'

// components
import { Tweet, Counter, Loader } from '../components'

class App extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.startPoll = this.startPoll.bind(this)
    this.endPoll = this.endPoll.bind(this)
    this.listen = this.listen.bind(this)
    this.setInitialState = this.setInitialState.bind(this)

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
      loading: true
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
        this.setState({ ...res.body, loading: false })
        this.ws = new window.WebSocket(
          `ws://${process.env.REACT_APP_BACKEND_API}`
        )
        this.listen(this.ws)
      })
  }

  listen(ws) {
    ws.onmessage = received => {
      var msg = JSON.parse(received.data)

      this.setState(prevState => {
        return {
          leftTweets: prevState.leftTweets.concat(msg.newLeftTweets),
          rightTweets: prevState.rightTweets.concat(msg.newRightTweets),
          leftCount: (prevState.leftCount += msg.newLeftTweets.length),
          rightCount: (prevState.rightCount += msg.newRightTweets.length)
        }
      })
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

  render() {
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
      <div className="App">
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
              {this.state.leftTweets.map(tweet => {
                return <Tweet key={tweet.id} data={tweet} />
              })}
            </div>
            <div className="col-sm-2" />
            <div className="col-sm-5">
              {this.state.rightTweets.map(tweet => {
                return <Tweet key={tweet.id} data={tweet} />
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
