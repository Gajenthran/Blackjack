import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup';

import './Game.css'

import { IMGS } from './../constants/images';
import { USERS_POS } from './../constants/css'


const ACTION = {
  "leave": 0,
  "draw": 1,
  "double": 2
}

const STATE = {
  "bet": 0,
  "play": 1,
  "end": 2
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
  winner
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
    if(action === ACTION["double"] && user.cards.length > 2)
      return
    event.preventDefault()
    socket.emit('game:update-action', { action })
  }


  useEffect(() => {
    socket.on('game:new-round', () => {
      setNewRound(true)

      let newRoundTimer = setTimeout(() => {
        setNewRound(false);
      }, 2000)

      return () => { clearTimeout(newRoundTimer) }
    })
  }, [socket])

  /**
   * Render all users in the game and show the status
   * of each user (white = leaving status, red =
   * must play and green = played) with the number
   * of gold.
   */
  const renderUsers = () => {
    return (
      <div className="div-users-container">
        {
          users.map((usr, index) => (
            <div 
              key={index}
              className="div-users-profile"
              style={USERS_POS[users.length - 1][index]}
            >
              <img 
                className="div-users-profile--img" 
                src={usr.img} 
                alt="pp"
                style={{
                  border: gameState.currentPlayer === usr.id && !usr.checked ? 
                    "2px solid white" : 
                    usr.checked ?
                      "2px solid #0f0f13" : "2px solid #525266",
                  transform: gameState.currentPlayer === usr.id 
                  && !usr.checked ? 
                    "scale(1.3)" : "scale(1.0)"
                }}
              />
              <div style={{opacity: !usr.alive ? 0.25 : 1}}>
                <p className="div-users-name"> {usr.name.substring(0, 5)} </p>
                <div className="div-users-tokens">
                  <img 
                    src={IMGS["token"]} 
                    alt="token" 
                    style={
                      usr.currentGold > 50 ? 
                      { animation: "grow 1s linear" } : null
                    }
                  />
                  {
                    usr.currentGold === -1 ?
                    <p> {usr.gold} </p>
                    :
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
                            usr.currentGold > 50 ? 
                            {animation: "grow 1s linear"} : null
                          }
                        />
                      )}
                    </CountUp>
                  }
                </div>
                <div className="player-container">
                  <div className="player-container-score">
                    {usr.score ? usr.score : null}
                  </div>
                  {
                    usr.cards ? 
                      usr.cards.map((card, index) => (
                        <img 
                          key={index}
                          style={!usr.checked ?
                            { transform: `translateX(${15 * index}px) translateY(${15 * index}px)`}
                            : {transform: `translateX(${10 * index}px) translateY(${10 * index}px)`}
                          }
                          src={IMGS[card.name]} 
                          alt="player-card" 
                        />
                    ))
                    :
                    null
                  }

                  {(usr.cards && usr.score === 21 && usr.cards.length === 2) &&
                    <div className="player-blackjack"> BLACKJACK </div>
                  }

                  {usr.score > 21 &&
                    <div className="player-blackjack"> DÉPASSÉ </div>
                  }
                </div>
              </div>
              {gameState.currentPlayer === socket.id && 
               gameState.currentPlayer === usr.id &&
               !usr.checked ?
                gameState.state === STATE["bet"] ? 
                  renderUserBet() : renderUserAction()
                :
                null
              }
            </div>
          ))
        }
      </div>
    );
  }

  const renderNextRound = () => {
    return (
      <div 
        className={"bg-turn"}
        style={{ animation: "bg-color 1.5s linear" }}
      >
        <div 
          className="next-turn-container"
          style={{ animation: "popup-scale 1.2s linear" }}
        >
          <p> TOUR {gameState.round}/{nbRound} </p>
        </div>
      </div>
    )
  }

  const onReturnLobby = () => {
    socket.emit('game:restart')
    setNewRound(false);
  }

  const renderWinner = () => {
    return (
      <div 
        className={"bg-winner"}
        style={{ animation: "bg-color 1.5s linear" }}
      >
        <div 
          className="winner-container"
          style={{ animation: "popup-scale 1.2s linear" }}
        >
          <img
            className="winner-crown-img"
            src={IMGS["crown"]}
            alt="crown"
            style={{animation: "rotating 0.9s ease infinite"}}
          />

          <img 
            src={winner.img} 
            alt="back"
          />
          <p> {winner.name} </p>
          <button 
            onClick={() => onReturnLobby()}
            style={{visibility: showReturnLobbyButton ? "visible": "hidden" }}
          > 
            RETOURNER AU LOBBY
          </button>
        </div>
      </div>
    )
  }


  const renderJudge = () => {
    const judgeRole = users.filter(usr => usr.checked).length === users.length
    return (
      <div className="judge-container"
        style={{opacity: gameState.score > 21 ? 0.25 : 1}}
      >
        <img 
          className="div-judge-profile--img" 
          src={IMGS["judge"]} 
          alt="pp"
          style={{
            border: judgeRole ? 
              "2px solid white" : "2px solid #0f0f13",
            transform: judgeRole ?  
              "scale(1.3)" : "scale(1.0)"
          }}
        />
        <div className="judge-container-score">
          {gameState.score ? gameState.score : null}
        </div>
        {
          gameState && gameState.cards ? 
            gameState.cards.map((card, index) => (
              <img 
                key={index}
                style={{ 
                  left: `${15 * index}px`, top: `${15 * index}px` 
                }}
                src={IMGS[card.name]} 
                alt="player-card" 
              />
            ))
            :
          null
        }


        {(gameState.cards && gameState.score === 21 && gameState.cards.length === 2) &&
          <div className="player-blackjack"> BLACKJACK </div>
        }

        {gameState.score > 21 &&
          <div className="player-blackjack"> DÉPASSÉ </div>
        }
      </div>
    )
  }

  const renderUserAction = () => {
    return (
      <div className="div-users--action">
        <div
          onClick={(e) => onAction(e, ACTION["draw"])}
          className="div-container div-users--continue"
        >
          <img src={IMGS["draw"]} alt="draw" />
        </div>
        <div
          onClick={(e) => onAction(e, ACTION["double"])}
          className={`div-container div-users--double ${user.cards.length > 2 ? 'btn-disable' : null}`}
        >
          <p> x2 </p>
        </div>
        <div
          onClick={(e) => onAction(e, ACTION["leave"])}
          className="div-container div-users--leave"
        >
          <img src={IMGS["quit"]} alt="draw" />
        </div>
      </div>
    )
  }

  const onBetValue = (e) => {
    const value = (e.target.validity.valid) ? e.target.value : bet;
    setBet(Math.min(100, Math.max(0, value)))
  }

  const validBet = () => {
    socket.emit('game:update-bet', { bet })
  }

  const renderUserBet = () => {
    return (
      <div className="div-users--bet">
        <div className="div-users--bet-token">
          <img 
            src={IMGS["token"]} 
            alt="token" 
          />
       </div>
       <div className="div-users--bet-input">
          <img 
           className="bet-increase"
            src={IMGS["rightArrow"]} 
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
            src={IMGS["rightArrow"]} 
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
      }, 5500);
    })
  }, [socket])


  const renderTurn = () => {
    return <p className="turn-container"> Tour {gameState.round}/{nbRound} </p>
  }

  return (
    <div id="game-container-id" className="div-game-container">
      {winner && renderWinner()}
      <img 
        className="game-full-screen" 
        src={IMGS["fullScreen"]}
        onClick={onFullscreen}
        alt="full-screen"
      />
      <div className="div-game">
          {renderJudge()}
          {renderUsers()}
          {renderTurn()}
          {newRound && renderNextRound()}
      </div>
    </div>
  )
}

export default Game
