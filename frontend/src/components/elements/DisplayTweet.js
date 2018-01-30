import React from 'react'

const DisplayTweet = ({ index, tweet }) => {
  let px = 720 + index * 75
  return (
    <div className={`display-tweet tweet-${index}`}>
      <div className="display-tweet-header pr-2">
        <div className="display-tweet-header-inner pl-3">
          <span className="display-tweet-name">{tweet.user.name}</span>
          <span className="display-tweet-username ml-3 mr-3">
            @{tweet.user.screen_name}
          </span>
          <i className="fab fa-twitter twitter-blue" />
        </div>
      </div>
      <div className="display-tweet-content" style={{ width: `${px}px` }}>
        <div className="display-tweet-content-inner">
          <div style={{ width: `${px - 100}px` }}>{tweet.text}</div>
          <img
            className="display-tweet-user-image mr-2"
            src={tweet.user.profile_image_url}
            alt={tweet.user.screen_name}
          />
        </div>
      </div>
    </div>
  )
}

export default DisplayTweet
