import React, { Component } from 'react'
import IdleTimer from 'react-idle-timer'

/**
 * URL redirection.
 */
const URL_REDIRECT = 'https://github.com/Gajenthran'

/**
 * Timeout redirection.
 */
const TIMEOUT_REDIRECT = 1000 * 60 * 2.3 // ms

/**
 * Idle component to check if a user idle on the website to
 * redirect him on an another url, in order to avoid overload.
 */
class Idle extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isTimedOut: false,
    }
    this.idleTimer = React.createRef()
  }

  /**
   * Handle if user do something.
   */
  _onAction() {
    this.setState({ isTimedOut: false })
  }

  /**
   * Handle if user do nothing.
   */
  _onIdle() {
    const { isTimedOut } = this.state
    if (isTimedOut) {
      if (typeof window !== undefined) {
        window.location.href = URL_REDIRECT
      }
    } else {
      this.idleTimer.current.reset()
      this.setState({ isTimedOut: true })
    }
  }

  /**
   * Create React fragment to add Idle component.
   */
  render() {
    return (
      <React.Fragment>
        <IdleTimer
          key="idleTimer"
          startOnMount={true}
          ref={this.idleTimer}
          element={document}
          onActive={this._onActive}
          onIdle={this._onIdle}
          timeout={TIMEOUT_REDIRECT}
        />
      </React.Fragment>
    )
  }
}

export default Idle
