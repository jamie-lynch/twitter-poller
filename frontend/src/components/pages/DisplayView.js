import React, { Component } from 'react'
import request from 'superagent'
import { Loader } from '../../components'
import ReactEcharts from 'echarts-for-react'

class DisplayView extends Component {
  constructor(props) {
    super(props)

    this.setInitialState = this.setInitialState.bind(this)
    this.listen = this.listen.bind(this)
    this.getOptions = this.getOptions.bind(this)

    this.state = {
      leftHashtag: '',
      rightHashtag: '',
      leftCount: 0,
      rightCount: 0,
      tweets: [],
      active: false,
      loading: true
    }
  }

  componentDidMount() {
    this.setInitialState()
  }

  setInitialState() {
    request
      .get(`//${process.env.REACT_APP_BACKEND_API}/get-display-data`)
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

      if (type === 'display') {
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

  getOptions() {
    let total = this.state.leftCount + this.state.rightCount || 1
    let left = Math.round(this.state.leftCount / total)
    let right = Math.round(this.state.rightCount / total)
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: [this.state.leftHashtag, this.state.rightHashtag]
      },
      series: [
        {
          name: 'hashtags',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: 'center'
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '30',
                fontWeight: 'bold'
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            {
              value: left,
              name: this.state.leftHashtag,
              itemStyle: { color: '#575756', opacity: 1 }
            },
            {
              value: right,
              name: this.state.rightHashtag,
              itemStyle: { color: '#e5007D', opacity: 1 }
            }
          ]
        }
      ]
    }
    return options
  }

  render() {
    if (this.state.loading) {
      return <Loader />
    }

    return (
      <div className="display">
        <div className="display-header">
          <div className="display-title-bar">
            <div className="display-title-first">
              <div className="display-title-text-1">Have your say</div>
            </div>
            <div className="display-title-join-1" />
            <div className="display-title-join-2" />
            <div className="display-title-second">
              <div className="display-title-text-2">#LSUMatchReport</div>
              <i className="fab fa-twitter mr-2 fa-2x twitter-blue" />
            </div>
            <div className="display-title-end-1" />
            <div className="display-title-end-2" />
          </div>
        </div>
        <img className="display-logo" src="/images/logo3d.png" alt="logo" />

        <div className="display-content">
          <div className="display-chart-container" />
          <div className="display-tweet-container">
            <div className="content-square" />
            <div className="right-angle" />
          </div>
        </div>
      </div>
    )
  }
}

export default DisplayView
