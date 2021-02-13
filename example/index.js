import React from 'react'
import ReactDOM from 'react-dom'

import App, { AppSecond, AppThird, AppFourth } from './App'

ReactDOM.render(<App />, document.getElementById('root'))

ReactDOM.render(<AppSecond />, document.getElementById('secondRoot'))

ReactDOM.render(<AppThird />, document.getElementById('thirdRoot'))

ReactDOM.render(<AppFourth />, document.getElementById('fourthRoot'))
