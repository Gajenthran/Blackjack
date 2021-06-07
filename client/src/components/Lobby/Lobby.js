import React, { useEffect, useState } from 'react'
import RangeSlider from 'react-bootstrap-range-slider'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { Fade } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'

import socket from './../../config/socket'

import './Lobby.css'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'

/**
 * Lobby component to manage the game options and
 * start the game.
 *
 * @param {object} lobbyUsers - lobby users
 * @param {string} [lobbyUsers.name] - username
 * @param {string} [lobbyUsers.room] - user room
 * @param {array} users - others users in the room
 */
const Lobby = ({ user, users }) => {
  const [hoverRules, setHoverRules] = useState(false)
  const [hoverUsers, setHoverUsers] = useState(false)
  const [nbRound, setNbRound] = useState(3)
  const [nbPlayer, setNbPlayer] = useState(2)
  const [x2Stars, setx2Stars] = useState(false)
  const [bet, setBet] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [mult, setMult] = useState(0)
  const [roundOptions, setRoundOptions] = useState(false)
  const [x2Options, setX2Options] = useState(false)
  const [playerOptions, setPlayerOptions] = useState(false)
  const [dupOptions, setDupOptions] = useState(false)
  const [multOptions, setMultOptions] = useState(false)
  const [betOptions, setBetOptions] = useState(false)

  useEffect(() => {
    socket.on('lobby:create-response', ({ user }) => {
      if (user === undefined || !(user.roomId || user.name)) return <Redirect to="/" />
    })
  })

  /**
   * Start the game and emit options game to the server.
   *
   * @param {object} event - event
   */
  const startGame = (event) => {
    socket.emit('game:start', { nbRound, nbPlayer, x2Stars, duplicate, mult })
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(window.location.href)
    e.target.focus()
  }

  /**
   * Render all users in the lobby.
   */
  const renderUsers = () => {
    return (
      <div
        onMouseEnter={() => setHoverUsers(true)}
        onMouseLeave={() => setHoverUsers(false)}
        className="lobby--container lobby-users-list"
      >
        <h3> JOUEURS</h3>
        <Fade in={hoverUsers}>
          <h5> ({users.length}) </h5>
        </Fade>
        <div className="lobby-users--list-row">
          <div className="lobby-users--infos-list" key={socket.id}>
            <div className="lobby-users--name">
              <img src={user.img} alt="avatar" />
              {user.name}
            </div>
          </div>
          {users.map(
            (user) =>
              user.id !== socket.id && (
                <div className="lobby-users--infos-list" key={user.id}>
                  <div className="lobby-users--name">
                    <img src={user.img} alt="avatar" />
                    {user.name}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    )
  }

  /**
   * Render game options.
   */
  const renderOptions = () => {
    return (
      <div
        onMouseEnter={() => setHoverRules(true)}
        onMouseLeave={() => setHoverRules(false)}
        className="lobby--container lobby-users-options"
      >
        <h3> OPTIONS </h3>
        <Fade in={hoverRules}>
          <h5> DE JEU </h5>
        </Fade>
        <div className="lobby-users-options-list">
          <div
            onMouseEnter={() => setRoundOptions(true)}
            onMouseLeave={() => setRoundOptions(false)}
          >
            <h6> TOURS </h6>
            <Fade in={roundOptions}>
              <div className="lobby-users-options-desc">
                Nombre de tours par partie
              </div>
            </Fade>
            <RangeSlider
              min={2}
              max={5}
              value={nbRound}
              onChange={(e) => setNbRound(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setPlayerOptions(true)}
            onMouseLeave={() => setPlayerOptions(false)}
          >
            <h6> JOUEURS</h6>
            <Fade in={playerOptions}>
              <div className="lobby-users-options-desc">
                Nombre de joueurs max. dans une partie
              </div>
            </Fade>
            <RangeSlider
              min={2}
              max={6}
              value={nbPlayer}
              onChange={(e) => setNbPlayer(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setX2Options(true)}
            onMouseLeave={() => setX2Options(false)}
          >
            <h6> x2 ÉTOILES </h6>
            <Fade in={x2Options}>
              <div className="lobby-users-options-desc">
                Les étoiles ne rapportent pas forcément 5 ors...
              </div>
            </Fade>
            <BootstrapSwitchButton
              onlabel={' '}
              offlabel={' '}
              checked={x2Stars}
              onstyle="outline-primary"
              offstyle="outline-secondary"
              width={130}
              height={5}
              onChange={() => setx2Stars(!x2Stars)}
            />
          </div>
          <div
            onMouseEnter={() => setBetOptions(true)}
            onMouseLeave={() => setBetOptions(false)}
          >
            <h6> BET </h6>
            <Fade in={betOptions}>
              <div className="lobby-users-options-desc">
                Parier sur l'apparition d'or dans la partie
              </div>
            </Fade>
            <BootstrapSwitchButton
              onlabel={' '}
              offlabel={' '}
              checked={x2Stars}
              onstyle="outline-primary"
              offstyle="outline-secondary"
              width={130}
              height={5}
              onChange={() => setBet(!bet)}
            />
          </div>
          <div
            onMouseEnter={() => setDupOptions(true)}
            onMouseLeave={() => setDupOptions(false)}
          >
            <h6> PAS DE DOUBLONS </h6>
            <Fade in={dupOptions}>
              <div className="lobby-users-options-desc">
                Dès qu&apos;une carte piège est piochée, c&apos;est perdu
              </div>
            </Fade>
            <BootstrapSwitchButton
              onlabel={' '}
              offlabel={' '}
              checked={duplicate}
              onstyle="outline-primary"
              offstyle="outline-secondary"
              width={130}
              height={5}
              onChange={() => setDuplicate(!duplicate)}
            />
          </div>
          <div
            onMouseEnter={() => setMultOptions(true)}
            onMouseLeave={() => setMultOptions(false)}
          >
            <h6> MULTIPLICATEUR </h6>
            <Fade in={multOptions}>
              <div className="lobby-users-options-desc">
                Plus vous avancez, plus vous serez récompensé
              </div>
            </Fade>
            <RangeSlider
              min={0}
              max={4.0}
              step={0.5}
              value={mult}
              onChange={(e) => setMult(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lobby-screen">
      {user ? (
        <div className="div-lobby">
          <div className="div-lobby--row">
            {renderOptions()}
            {renderUsers()}
          </div>

          <div className="lobby-start-game">
            <button onClick={(e) => startGame(e)}> LANCER LA PARTIE </button>
            <button onClick={(e) => copyToClipboard(e)}> INVITER </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Lobby
