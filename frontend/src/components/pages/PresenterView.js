// utils
import React, { Component } from 'react'
import request from 'superagent'

// components
import { Tweet, Counter, Loader } from '../../components'

class PresenterView extends Component {
  constructor(props) {
    super(props)

    this.setInitialState = this.setInitialState.bind(this)
    this.listen = this.listen.bind(this)

    this.state = {
      tweets: [],
      leftCount: 0,
      rightCount: 0,
      leftHashtag: '',
      rightHashtag: '',
      loading: true
    }
  }

  componentDidMount() {
    this.setInitialState()
  }

  setInitialState() {
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-presenter-data`)
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
      var { type, data } = msg

      console.log(msg)

      if (type === 'presenter') {
        this.setState({ tweets: data })
      } else if (type === 'main') {
        this.setState(prevState => {
          return {
            leftCount: (prevState.leftCount += data.newLeftTweets.length),
            rightCount: (prevState.rightCount += data.newRightTweets.length)
          }
        })
      }
    }
  }

  render() {
    let header = (
      <div className="header d-flex flex-column align-items-center mb-4">
        <h1>Twitter Poller - Presenter View</h1>
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
      <div className="PresenterView">
        {header}

        <div className="row">
          <div className="col-sm-5">
            <div>{this.state.leftHashtag}</div>
            <Counter count={this.state.leftCount} />
          </div>
          <div className="col-sm-2" />
          <div className="col-sm-5">
            <div>{this.state.rightHashtag}</div>
            <Counter count={this.state.rightCount} />
          </div>
        </div>

        <div className="row">
          {this.state.tweets.map(tweet => {
            return <Tweet key={tweet.id} data={tweet} />
          })}
        </div>
      </div>
    )
  }
}

export default PresenterView
