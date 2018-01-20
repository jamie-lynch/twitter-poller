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
      active: false,
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
        this.setState({
          leftCount: res.body.leftCount,
          rightCount: res.body.rightCount,
          leftHashtag: res.body.leftHashtag,
          rightHashtag: res.body.rightHashtag,
          tweets: res.body.presenterTweets,
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
        <h1>Twitter Poller</h1>
        <p>Survey opinions by counting tweets</p>
        <h4>Presenter View</h4>
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

        <div className="row justify-content-center">
          <div className="col-sm-4 col-md-3">
            <div className="d-flex flex-row justify-content-center">
              <h4>#{this.state.leftHashtag}</h4>
            </div>
            <Counter count={this.state.leftCount} />
          </div>
          <div className="col-sm-4 col-md-3">
            <div className="d-flex flex-row justify-content-center">
              <h4>#{this.state.rightHashtag}</h4>
            </div>
            <Counter count={this.state.rightCount} />
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-6, col-sm-10 m-3">
            {this.state.tweets.map(tweet => {
              return <Tweet key={tweet.id} data={tweet} />
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default PresenterView
