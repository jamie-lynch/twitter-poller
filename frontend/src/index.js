import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import 'typeface-roboto'

// This is generated by the SCSS compiler
import './index.css'

import {
  PageMainController,
  PagePresenterView,
  PageDisplayView
} from './components/'

const Root = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={PageMainController} />
        <Route exact path="/presenter" component={PagePresenterView} />
        <Route exact path="/display" component={PageDisplayView} />
      </Switch>
    </BrowserRouter>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
