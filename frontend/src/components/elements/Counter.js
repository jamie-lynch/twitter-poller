import React from 'react'

const Counter = ({ count }) => (
  <div className="counter">
    <div className="counter-text">Number of Tweets</div>
    <div className="counter-value">{count}</div>
  </div>
)

export default Counter
