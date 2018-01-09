import React, { Component } from 'react'
import request from 'superagent'

class App extends Component {
  constructor(props) {
    super(props)

    this.getTweets = this.getTweets.bind(this)
    this.togglePoll = this.togglePoll.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      // Available values: 'Start' | 'Stop'
      buttonState: 'Start',
      leftTweets: null,
      rightTweets: null,
      leftHashtag: '',
      rightHashtag: ''
    }

    this.updateInterval = null
  }

  getTweets() {
    if (!this.state.leftHashtag) {
      return this.setState({ leftTweets: null })
    }
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-tweets`)
      .query({ hashtag: this.state.leftHashtag })
      .end((err, res) => {
        this.setState({ leftTweets: res.body.statuses })
      })

    if (!this.state.rightHashtag) {
      return this.setState({ rightTweets: null })
    }
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-tweets`)
      .query({ hashtag: this.state.rightHashtag })
      .end((err, res) => {
        this.setState({ rightTweets: res.body.statuses })
      })
  }

  togglePoll() {
    this.setState(prevState => {
      if (prevState.buttonState === 'Start') {
        this.updateInterval = window.setInterval(() => {
          this.getTweets()
        }, 5000)
        return { buttonState: 'Stop' }
      } else {
        window.clearInterval(this.updateInterval)
        return { buttonState: 'Start' }
      }
    })
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    return (
      <div className="App">
        <h1>Twitter Poller</h1>
        <p>Survey opinions by counting tweets</p>
        <br />

        <div className="container">
          <div className="row">
            <div className="col-sm-5">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon1">
                    #
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
                  disabled={this.state.buttonState === 'Stop'}
                />
              </div>
            </div>

            <div className="col-sm-2">
              <button
                className="btn btn-primary"
                disabled={
                  this.state.buttonState === 'Start' &&
                  (!this.state.leftHashtag || !this.state.rightHashtag)
                }
                onClick={this.togglePoll}
              >
                {this.state.buttonState}
              </button>
            </div>

            <div className="col-sm-5">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon1">
                    #
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
                  onChange={this.handleChange}
                  disabled={this.state.buttonState === 'Stop'}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-5">
              {this.state.leftTweets &&
                (this.state.leftTweets.length ? (
                  this.state.leftTweets.map(tweet => {
                    return (
                      <div key={tweet.id}>
                        <div className="tweet">
                          <div>Name: {tweet.user.name}</div>
                          <div>Handle: {tweet.user.screen_name}</div>
                          <div>Text: {tweet.text}</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <span>No Tweets available for this hashtag</span>
                ))}
            </div>
            <div className="col-sm-2" />
            <div className="col-sm-5">
              {this.state.rightTweets &&
                (this.state.rightTweets.length ? (
                  this.state.rightTweets.map(tweet => {
                    return (
                      <div key={tweet.id}>
                        <div className="tweet">
                          <div>Name: {tweet.user.name}</div>
                          <div>Handle: {tweet.user.screen_name}</div>
                          <div>Text: {tweet.text}</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <span>No Tweets available for this hashtag</span>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
