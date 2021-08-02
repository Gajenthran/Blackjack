import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'

import './Game.css'

import { IMGS } from './../constants/images'
import { USERS_POS } from './../constants/css'

const ACTION = {
  leave: 0,
  draw: 1,
  double: 2,
}

const STATE = {
  bet: 0,
  play: 1,
  end: 2,
}

/**
 * Game component to play Ginho. A game is divided into
 * several rounds. In each round, users must indicates if
 * they decide to continue or not.
 *
 * @param {object} gparam - game details
 * @param {object} gparam.socket - socket io
 * @param {object} gparam.user - user
 * @param {array} gparam.users - other users
 * @param {object} gparam.gameState - game state
 * @param {boolean} gparam.dupCard - check duplicate card in the deck.
 * @param {boolean} gparam.hasRemainingUser - check remaining user to play
 * @param {number} gparam.nbRound - game round
 */
const Game = ({
  socket,
  user,
  users,
  gameState,
  nbRound,
  onFullscreen,
  winner,
}) => {
  const [newRound, setNewRound] = useState(false)
  const [showReturnLobbyButton, setShowReturnLobbyButton] = useState(false)
  const [bet, setBet] = useState(1)

  /**
   * Handle user action (either continue the
   * round, or exit). Then, emit the user action
   * to the server.
   *
   * @param {object} event - event
   * @param {number} action - action (leaving or continue)
   */
  const onAction = (event, action) => {
    if (action === ACTION['double'] && user.cards.length > 2) return
    event.preventDefault()
    socket.emit('game:update-action', { action })
  }

  useEffect(() => {
    socket.on('game:new-round', () => {
      setNewRound(true)

      let newRoundTimer = setTimeout(() => {
        setNewRound(false)
      }, 2000)

      return () => {
        clearTimeout(newRoundTimer)
      }
    })
  }, [socket])

  const renderUsers = () => {
    return (
      <div className="div-users-container">
        {users.map((usr, index) => (
          <div key={index} className="div-users-profile-container">
            <div
              className="player-container"
              style={{ opacity: usr.score > 21 ? 0.25 : 1 }}
            >
              <div className="player-container-score">
                {usr.score ? usr.score : null}
              </div>
              {usr.cards
                ? usr.cards.map((card, index) => (
                    <img
                      key={index}
                      style={
                        !usr.checked
                          ? {
                              transform: `translateX(${
                                15 * index
                              }px) translateY(${15 * index}px)`,
                            }
                          : {
                              transform: `translateX(${
                                10 * index
                              }px) translateY(${10 * index}px)`,
                            }
                      }
                      src={IMGS[card.name]}
                      alt="player-card"
                    />
                  ))
                : null}

              {usr.cards && usr.score === 21 && usr.cards.length === 2 && (
                <div
                  className="player-blackjack"
                  style={{
                    textShadow: '1px 1px 10px white',
                    color: '#f8d556',
                  }}
                >
                  BLACKJACK
                </div>
              )}

              {usr.score > 21 && (
                <div className="player-blackjack"> DÉPASSÉ </div>
              )}
            </div>

            <div
              key={index}
              className="div-users-profile"
              style={{
                boxShadow:
                  gameState.currentPlayer === usr.id && !usr.checked
                    ? '0px 3px 0px #f8d556'
                    : '0px 3px 0px #575757',
              }}
            >
              <img className="div-users-profile--img" src={usr.img} alt="pp" />
              <div style={{ opacity: !usr.alive ? 0.25 : 1 }}>
                <p className="div-users-name"> {usr.name.substring(0, 5)} </p>
                <div className="div-users-tokens">
                  <img
                    src={IMGS['token']}
                    alt="token"
                    style={
                      usr.currentGold > 50
                        ? { animation: 'grow 1s linear' }
                        : null
                    }
                  />
                  {usr.currentGold === -1 ? (
                    <p> {usr.gold} </p>
                  ) : (
                    <CountUp
                      start={usr.gold - usr.currentGold}
                      end={usr.gold}
                      duration={3}
                      delay={0}
                    >
                      {({ countUpRef }) => (
                        <p
                          ref={countUpRef}
                          style={
                            usr.currentGold > 50
                              ? { animation: 'grow 1s linear' }
                              : null
                          }
                        />
                      )}
                    </CountUp>
                  )}
                </div>
              </div>
            </div>

            {gameState.currentPlayer === socket.id &&
            gameState.currentPlayer === usr.id &&
            !usr.checked
              ? gameState.state === STATE['bet']
                ? renderUserBet()
                : renderUserAction()
              : null}
          </div>
        ))}
      </div>
    )
  }

  const renderNextRound = () => {
    return (
      <div className="bg-turn">
        <div
          className="next-turn-container"
          style={{ animation: 'popup-scale 1.2s linear' }}
        >
          <p>
            TOUR {gameState.round}/{nbRound}
          </p>
        </div>
      </div>
    )
  }

  const onReturnLobby = () => {
    socket.emit('game:restart')
    setNewRound(false)
  }

  const renderWinner = () => {
    const sortedUsers = users
      .sort((u1, u2) => (u1.gold < u2.gold ? 1 : -1))
      .slice(0, 3)

    if (sortedUsers.length === 2) {
      sortedUsers.pop()
    } else if (sortedUsers.length > 2) {
      const tmp = sortedUsers[0]
      sortedUsers[0] = sortedUsers[1]
      sortedUsers[1] = tmp
    }

    return (
      <div className="bg-winner">
        <div
          className="winner-container"
          style={{ animation: 'popup-scale 1.2s linear' }}
        >
          {sortedUsers.map((usr, index) => (
            <div key={index} className="winner-container-avatar">
              <div className="winner-container-img">
                {(sortedUsers.length < 3 || index === 1) && (
                  <img
                    className="winner-crown-img"
                    src={IMGS['crown']}
                    alt="crown"
                    style={{ animation: 'rotating 0.9s ease infinite' }}
                  />
                )}
                <img src={usr.img} alt="back" />
                <div className="winner-container-name">
                  <p>{usr.name.slice(0, 10)} </p>
                  <span className="winner-score">
                    <img src={IMGS['token']} alt="token" />
                    <CountUp start={0} end={usr.gold} duration={2} delay={0}>
                      {({ countUpRef }) => <p ref={countUpRef} />}
                    </CountUp>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onReturnLobby()}
          className="return-lobby-btn"
          style={{ visibility: showReturnLobbyButton ? 'visible' : 'hidden' }}
        >
          RETOURNER AU LOBBY
        </button>
      </div>
    )
  }

  const renderJudge = () => {
    const judgeRole = users.filter((usr) => usr.checked).length === users.length
    return (
      <div
        className="judge-container"
        style={{ opacity: gameState.score > 21 ? 0.25 : 1 }}
      >
        <div className="judge-profile-container">
          <div
            className="judge-profile"
            style={{
              boxShadow: judgeRole
                ? '0px 3px 0px #f8d556'
                : '0px 3px 0px #575757',
            }}
          >
            <img
              className="div-judge-profile--img"
              src={IMGS['judge']}
              alt="pp"
            />
            <p> CROUPIER </p>
          </div>

          <div className="judge-container-cards">
            <div className="player-container-score">
              {gameState.score ? gameState.score : null}
            </div>
            {gameState && gameState.cards
              ? gameState.cards.map((card, index) => (
                  <img
                    key={index}
                    style={{
                      left: `${15 * index}px`,
                      top: `${15 * index}px`,
                    }}
                    src={IMGS[card.name]}
                    alt="player-card"
                  />
                ))
              : null}
            {gameState.score ? gameState.score : null}

            {gameState.cards &&
              gameState.score === 21 &&
              gameState.cards.length === 2 && (
                <div
                  className="player-blackjack"
                  style={{
                    textShadow: '1px 1px 10px white',
                    color: '#f8d556',
                  }}
                >
                  BLACKJACK
                </div>
              )}

            {gameState.score > 21 && (
              <div className="player-blackjack"> DÉPASSÉ </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderUserAction = () => {
    return (
      <div className="div-users--action">
        <div
          onClick={(e) => onAction(e, ACTION['draw'])}
          className={`div-container div-users--continue ${
            user.score === 21 && user.cards.length === 2 ? 'btn-disable' : null
          }`}
        >
          <img src={IMGS['draw']} alt="draw" />
        </div>
        <div
          onClick={(e) => onAction(e, ACTION['double'])}
          className={`div-container div-users--double ${
            user.cards.length > 2 ||
            (user.score === 21 && user.cards.length === 2)
              ? 'btn-disable'
              : null
          }`}
        >
          <p> x2 </p>
        </div>
        <div
          onClick={(e) => onAction(e, ACTION['leave'])}
          className="div-container div-users--leave"
        >
          <img src={IMGS['quit']} alt="draw" />
        </div>
      </div>
    )
  }

  const onBetValue = (e) => {
    const value = e.target.validity.valid ? e.target.value : bet
    setBet(Math.min(100, Math.max(0, value)))
  }

  const validBet = () => {
    socket.emit('game:update-bet', { bet })
  }

  const renderUserBet = () => {
    return (
      <div className="div-users--bet">
        <div className="div-users--bet-token">
          <img src={IMGS['token']} alt="token" />
        </div>
        <div className="div-users--bet-input">
          <img
            className="bet-increase"
            src={IMGS['rightArrow']}
            alt="token"
            onClick={() => setBet(Math.min(100, bet + 10))}
          />
          <input
            value={bet}
            name="betInput"
            pattern="[0-9]*"
            onChange={(e) => onBetValue(e)}
          />
          <img
            className="bet-decrease"
            src={IMGS['rightArrow']}
            alt="token"
            onClick={() => setBet(Math.max(0, bet - 10))}
          />
        </div>
        <div
          onClick={() => validBet()}
          className="div-container div-users--double"
        >
          <p> OK </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    socket.on('game:end-game', () => {
      setTimeout(() => {
        setShowReturnLobbyButton(true)
      }, 5500)
    })
  }, [socket])

  const renderTurn = () => {
    return (
      <p className="turn-container">
        {' '}
        Tour {gameState.round}/{nbRound}{' '}
      </p>
    )
  }

  return (
    <div id="game-container-id" className="div-game-container">
      {winner && renderWinner()}
      {newRound && renderNextRound()}
      <img
        className="game-full-screen"
        src={IMGS['fullScreen']}
        onClick={onFullscreen}
        alt="full-screen"
      />
      <div className="div-game">
        {renderJudge()}
        {renderUsers()}
        {renderTurn()}
      </div>
    </div>
  )
}

export default Game
