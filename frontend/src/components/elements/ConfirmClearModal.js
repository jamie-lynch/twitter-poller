import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const ConfirmClearModal = ({ open, toggle, shortlist, confirm }) => (
  <Modal isOpen={open} toggle={toggle} className="shortlist-modal">
    <ModalHeader toggle={toggle}>Are you sure?</ModalHeader>
    <ModalBody>
      {`No really, do you definitely want to clear the ${shortlist} modal? If you do this and it's on air you're going to look really silly.`}
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

export default ConfirmClearModal
