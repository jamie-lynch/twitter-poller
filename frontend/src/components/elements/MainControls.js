import React from 'react'

const MainControls = ({ onControlClick }) => (
  <nav className="navbar fixed-bottom justify-content-start">
    <span className="navbar-brand">
      <i className="fas fa-list fa-lg" />
    </span>

    <div className="navbar-controls">
      <span onClick={() => onControlClick('presenter')}>
        <i className="far fa-user fa-lg" />
      </span>
      <span onClick={() => onControlClick('display')}>
        <i className="fas fa-tv fa-lg" />
      </span>
    </div>
  </nav>
)

export default MainControls
