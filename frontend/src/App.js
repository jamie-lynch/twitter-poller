import React, { Component } from 'react'
import './styles/App.css'
import request from 'superagent'

class App extends Component {
  constructor(props) {
    super(props)

    this.getTweets = this.getTweets.bind(this)
    this.enableEnter = this.enableEnter.bind(this)

    this.state = {
      tweets: null
    }
  }

  getTweets() {
    if (!this.refs.hashtag.value) {
      return this.setState({ tweets: null })
    }
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-tweets`)
      .query({ hashtag: this.refs.hashtag.value })
      .end((err, res) => {
        this.setState({ tweets: res.body.statuses })
      })
  }

  enableEnter(event) {
    // return true for anything except the enter key
    if (event.charCode !== 13) {
      return true
    } else {
      // submit the form when the user hits enter
      this.getTweets(event)
      return false
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Twitter Poller</h1>
        <p>Survey opinions by counting tweets</p>
        <br />
        <h3>
          Tweets For #
          <input
            type="text"
            name="hashtag"
            ref="hashtag"
            placeholder="hashtag"
            onBlur={this.getTweets}
            onKeyPress={this.enableEnter}
          />
        </h3>

        <div>
          {this.state.tweets &&
            (this.state.tweets.length ? (
              this.state.tweets.map(tweet => {
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
    )
  }
}

export default App
