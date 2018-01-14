import React from 'react'
import moment from 'moment'

const Tweet = ({ data }) => (
  <div className="tweet">
    <div className="tweet-header">
      <div className="tweet-user d-flex flex-row justify-content-start align-items-center">
        <img
          className="tweet-user-image mr-2"
          src={data.user.profile_image_url}
          alt={data.user.screen_name}
        />
        <div className="tweet-user-names">
          <div className="tweet-user-name">{data.user.name}</div>
          <div className="tweet-user-username">@{data.user.screen_name}</div>
        </div>
      </div>
      <div className="tweet-logo align-self-start">
        <i className="fab fa-twitter" />
      </div>
    </div>
    <div className="tweet-content mt-3 mb-1">{data.text}</div>
    <div className="tweet-footer">
      {moment(data.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format(
        'h:mm A - MMM DD, YYYY'
      )}
    </div>
  </div>
)

export default Tweet
