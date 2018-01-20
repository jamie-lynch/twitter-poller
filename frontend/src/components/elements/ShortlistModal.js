import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Tweet } from '../../components'

const ShortlistModal = ({
  open,
  toggle,
  shortlist,
  tweets,
  onIconClick,
  clear
}) => (
  <Modal isOpen={open} toggle={toggle} className="shortlist-modal" size="lg">
    <ModalHeader toggle={toggle}>
      {shortlist.charAt(0).toUpperCase() + shortlist.slice(1)} Shortlist
    </ModalHeader>
    <ModalBody>
      {tweets.length ? (
        tweets.map(tweet => {
          return (
            <Tweet
              key={tweet.id}
              data={tweet}
              onIconClick={onIconClick}
              control="main"
            />
          )
        })
      ) : (
        <div>There are currently no tweets in this list</div>
      )}
    </ModalBody>
    <ModalFooter>
      <button className="btn btn-danger" onClick={() => clear(shortlist)}>
        Clear
      </button>
      <button className="btn btn-primary" onClick={toggle}>
        Close
      </button>
    </ModalFooter>
  </Modal>
)

export default ShortlistModal
