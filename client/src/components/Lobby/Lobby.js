import React, { useState } from 'react'
import Slider from 'rc-slider'

import socket from './../../config/socket'

import 'rc-slider/assets/index.css'

import './Lobby.css'
import { IMGS } from '../constants/images'

const Lobby = ({ user, users }) => {
  const [nbRound, setNbRound] = useState(3)
  const [nbPlayer, setNbPlayer] = useState(4)
  const [x2Stars, setX2Stars] = useState(45)
  const [bet, setBet] = useState(true)
  const [duplicate, setDuplicate] = useState(true)
  const [mult, setMult] = useState(0)
  const [invitedMessage, setInvitedMessage] = useState(false)

  const startGame = () => {
    socket.emit('game:start', {
      nbRound,
      nbPlayer,
      x2Stars,
      bet,
      duplicate,
      mult,
    })
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(window.location.href)
    e.target.focus()
    setInvitedMessage(true)
    setTimeout(() => {
      setInvitedMessage(false)
    }, 2000)
  }

  /**
   * Render all users in the lobby.
   */
  const renderUsers = () => {
    return (
      <div className="lobby-users-list">
        <h3> JOUEURS - {users.length} </h3>
        <div className="lobby-users--list-row">
          {users.map((user, index) => (
            <div className="lobby-users--infos-list" key={user.id}>
              <div className="lobby-users--name">
                <div className="lobby-users--avatar">
                  {index === users.length - 1 && (
                    <img
                      src={IMGS['crown']}
                      className="lobby-user-crown"
                      alt="avatar"
                    />
                  )}
                  <img
                    src={user.img}
                    className="lobby-user-avatar"
                    alt="avatar"
                  />
                </div>
                <p> {user.name} </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Render game options.
   */
  const renderOptions = () => {
    return (
      <div className="lobby-users-options">
        <h3> OPTIONS </h3>
        <div className="lobby-users-options-list">
          <div className="lobby-users-options-element">
            <h6> JOUEURS MAX </h6>
            <Slider
              min={4}
              max={6}
              value={nbPlayer}
              onChange={(v) => setNbPlayer(v)}
              marks={{ 4: '4', 5: '5', 6: '6' }}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> NOMBRES DE TOURS </h6>
            <Slider
              min={2}
              max={8}
              value={nbRound}
              onChange={(v) => setNbRound(v)}
              marks={{ 2: '2', 3: '3', 5: '5', 8: '8' }}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> MULTIPLICATEUR </h6>
            <Slider
              min={0}
              max={4.0}
              step={0.5}
              value={mult}
              onChange={(v) => setMult(v)}
              marks={{ 0: '0', 1.0: '1', 2.0: '2', 3.0: '3', 4.0: '4' }}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> X2 ETOILES </h6>
            <div className="toggle-lobby-container" style={{ top: 0 }}>
              <input
                type="checkbox"
                id="toggle-lobby-qcm"
                onClick={() => setX2Stars(!x2Stars)}
              />
              <label
                className="lobby-toggle-label"
                htmlFor="toggle-lobby-qcm"
              ></label>
            </div>
          </div>
          <div className="lobby-users-options-element">
            <h6> BET </h6>
            <div className="toggle-lobby-container" style={{ top: 0 }}>
              <input
                type="checkbox"
                id="toggle-lobby-streak"
                onClick={() => setBet(!bet)}
              />
              <label
                className="lobby-toggle-label"
                htmlFor="toggle-lobby-streak"
              ></label>
            </div>
          </div>
          <div className="lobby-users-options-element">
            <h6> DOUBLONS </h6>
            <div className="toggle-lobby-container" style={{ top: 0 }}>
              <input
                type="checkbox"
                id="toggle-lobby-random"
                onClick={() => setDuplicate(!duplicate)}
              />
              <label
                className="lobby-toggle-label"
                htmlFor="toggle-lobby-random"
              ></label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const onReturnHome = () => {
    window.location = '/'
  }

  return (
    <>
      <div className="lobby-screen">
        {user && users ? (
          <div className="div-lobby">
            <h3 className="lobby--title" onClick={() => onReturnHome()}>
              BLACKJACK
            </h3>
            <div className="lobby--container">
              {renderOptions()}
              {renderUsers()}
            </div>

            <div className="lobby-start-game">
              <button onClick={(e) => startGame(e)}> LANCER LA PARTIE </button>
              <button
                className="lobby--invite-btn"
                onClick={(e) => copyToClipboard(e)}
              >
                INVITER {invitedMessage && <span> COPIÉ </span>}
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  )
}

export default Lobby
