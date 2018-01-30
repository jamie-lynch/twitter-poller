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

    this.ws = null
  }

  componentDidMount() {
    this.setInitialState()
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close()
    }
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
          tweets: res.body.displayTweets,
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
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} - {c} ({d}%)'
      },
      series: [
        {
          name: 'Tweet Count',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [
            {
              value: this.state.leftCount,
              name: `#${this.state.leftHashtag}`,
              itemStyle: {
                normal: {
                  color: '#e5007d',
                  shadowBlur: 200,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            },
            {
              value: this.state.rightCount,
              name: `#${this.state.rightHashtag}`,
              itemStyle: {
                normal: {
                  color: '#575756',
                  shadowBlur: 200,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ].sort(function(a, b) {
            return a.value - b.value
          }),
          roseType: 'radius',
          label: {
            normal: {
              textStyle: {
                color: '#fff',
                fontSize: '18'
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: '#fff'
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            }
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function(idx) {
            return Math.random() * 200
          }
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
        {/* HEADER */}
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
          {/* CHART */}
          <div className="display-chart-container">
            <div className="chart-inner-content">
              <span className="display-chart-title">Your tweets so far...</span>
              <ReactEcharts
                className="display-chart"
                option={this.getOptions()}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          </div>

          {/* TWEETS */}
          <div className="display-tweet-container" />
        </div>
      </div>
    )
  }
}

export default DisplayView
