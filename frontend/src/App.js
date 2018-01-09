import React, { Component } from 'react'
import request from 'superagent'

class App extends Component {
  constructor(props) {
    super(props)

    this.getTweets = this.getTweets.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      leftTweets: null,
      rightTweets: null,
      leftHashtag: '',
      rightHashtag: ''
    }
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
                />
              </div>
            </div>

            <div className="col-sm-2">
              <button
                className="btn btn-primary"
                disabled={!this.state.leftHashtag || !this.state.rightHashtag}
                onClick={this.getTweets}
              >
                Start
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
