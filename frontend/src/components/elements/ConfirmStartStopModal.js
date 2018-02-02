import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const ConfirmStartStopModal = ({ open, toggle, action, confirm }) => (
  <Modal isOpen={open} toggle={toggle} className="shortlist-modal">
    <ModalHeader toggle={toggle}>Are you sure?</ModalHeader>
    <ModalBody>
      {action === 'Start'
        ? `Are you sure you want to start the poll? All current data will be cleared`
        : `Are you sure you want to stop the poll? Once stopped it cannot be resumed.`}
    </ModalBody>
    <ModalFooter>
      <button className="btn btn-danger" onClick={() => confirm()}>
        Confirm
      </button>
      <button className="btn btn-primary" onClick={toggle}>
        Cancel
      </button>
    </ModalFooter>
  </Modal>
)

export default ConfirmStartStopModal
