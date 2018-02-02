import React, { Component } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Tweet, ConfirmClearModal } from '../../components'

class ShortlistModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      confirmOpen: false
    }

    this.confirm = this.confirm.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  open() {
    this.setState({ confirmOpen: true })
  }

  close() {
    this.setState({ confirmOpen: false })
  }

  confirm() {
    this.setState({ confirmOpen: false })
    this.props.clear(this.props.shortlist)
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        toggle={this.props.toggle}
        className="shortlist-modal"
        size="lg"
      >
        <ModalHeader toggle={this.props.toggle}>
          {this.props.shortlist.charAt(0).toUpperCase() +
            this.props.shortlist.slice(1)}{' '}
          Shortlist
        </ModalHeader>
        <ModalBody>
          {this.props.tweets.length ? (
            this.props.tweets.map(tweet => {
              return (
                <Tweet
                  key={tweet.id}
                  data={tweet}
                  onIconClick={this.props.onIconClick}
                  control="main"
                />
              )
            })
          ) : (
            <div>There are currently no tweets in this list</div>
          )}
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-danger" onClick={this.open}>
            Clear
          </button>
          <button className="btn btn-primary" onClick={this.props.toggle}>
            Close
          </button>
        </ModalFooter>
        <ConfirmClearModal
          shortlist={this.props.shortlist}
          confirm={this.confirm}
          open={this.state.confirmOpen}
          toggle={this.close}
        />
      </Modal>
    )
  }
}

export default ShortlistModal
