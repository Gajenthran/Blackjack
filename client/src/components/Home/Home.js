import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Fade } from 'react-bootstrap'

import socket from './../../config/socket'

import './Home.css'

import Navbar from './../Navbar/Navbar'

import { userAvatar, NB_AVATARS } from './'

const KEY_LENGTH = 8
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const createRandomKey = () => {
  const nbChars = CHARS.length
  let r = 0
  let key = ''
  for (let i = 0; i < KEY_LENGTH; i++) {
    r = Math.floor(Math.random() * nbChars)
    key += CHARS[r]
  }

  return key
}

/**
 * Home component to create an user and a lobby.
 * There is also game rules.
 */
const Home = () => {
  const [name, setName] = useState('')
  const [hoverGame, setHoverGame] = useState(false)
  const [hoverRules, setHoverRules] = useState(false)
  const [avatarIndex, setAvatarIndex] = useState(0)
  const room = createRandomKey()

  const onCreateLobby = () => {
    const user = { name, img: userAvatar.avatars[avatarIndex] }
    if (name.length !== 0) socket.emit('lobby:create', { user, room })
  }

  /**
   * Render game layout to login.
   */
  const renderGame = () => {
    return (
      <div
        onMouseEnter={() => setHoverGame(true)}
        onMouseLeave={() => setHoverGame(false)}
        className="home--container div-home--row--game"
      >
        <h3> JOUER </h3>
        <Fade in={hoverGame}>
          <h5> UNE PARTIE </h5>
        </Fade>
        <div className="div-home--form">
          <img
            className="avatar-img"
            src={userAvatar.avatars[avatarIndex]}
            alt="avatar-img"
          />
          <img
            className="avatar-left-arrow"
            src={userAvatar.leftArrow}
            alt="left-arrow-img"
            onClick={() =>
              setAvatarIndex(
                avatarIndex - 1 < 0 ? NB_AVATARS - 1 : avatarIndex - 1
              )
            }
          />
          <img
            className="avatar-right-arrow"
            src={userAvatar.rightArrow}
            alt="right-arrow-img"
            onClick={() => setAvatarIndex((avatarIndex + 1) % NB_AVATARS)}
          />
          <input
            placeholder="Name"
            className="joinInput"
            type="text"
            onChange={(event) => setName(event.target.value)}
          />
          <Link
            onClick={() => onCreateLobby()}
            to={name.length !== 0 ? `/game?room=${room}` : '/'}
          >
            <button className="button mt-20" type="submit">
              {' '}
              CREER UN SALON{' '}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  /**
   * Render game rules.
   */
  const renderRules = () => {
    return (
      <div
        onMouseEnter={() => setHoverRules(true)}
        onMouseLeave={() => setHoverRules(false)}
        className="home--container div-home--row--rules"
      >
        <h3> RÈGLES </h3>
        <Fade in={hoverRules}>
          <h5> DU JEU </h5>
        </Fade>
        <div>
          <div className="div-home--row--rules-desc">
            Le jeu est composé de 34 cartes : <br /> 14 cartes Or (1, 2, 3, 4,
            5, 5, 7, 7, 9, 11, 11, 13, 14, 15 Ors) <br /> 15 cartes Piège (3 de
            chaque type : Bowser, Piranha, Blooper, Koopa et Thwomp) <br /> 5
            cartes Étoiles (artéfact) <br /> Au début du jeu, toutes les cartes
            sont mélangées ensemble. <br />
            <br /> Le jeu comporte 5 manches. L&apos;aventurier avec le plus de
            points à la fin de partie gagne : chaque or récolté vaut 1 point et
            chaque étoile vaut 5 points. <br />
            <br /> Lors du tour d&apos;une aventure, une carte du paquet est
            révélée <br /> - Si une carte Or est révélée, les ors sont partagés
            équitablement entre les joueurs. Les ors restants sont posés dans la
            trésorie et attendent la sortie d&apos;un aventurier. <br /> - Si
            une carte Piège est révélée, deux cas sont possibles : <br /> - Si
            c&apos;est la première carte Piège de ce type apparue lors de
            l&apos;expédition, il ne se passe rien. <br /> - Si c&apos;est la
            deuxième, l&apos;expédition est ratée. Tous les joueurs encore en
            jeu rentrent au campement sans butin. <br /> - Si l&apos;expédition
            n&apos;a pas raté (rappel : deux cartes Piège identiques),
            l&apos;expédition se poursuit et chaque joueur doit décider
            s&apos;il reste dans l&apos;expédition ou s&apos;il rentre au
            campement. Les décisions s&apos;effectuent secrètement puis sont
            révélées simultanément. <br /> <br /> Les aventuriers étant rentrés
            au campement ne participent plus à l&apos;expédition. Ils récupèrent
            les ors qui étaient restées sur les cartes (celles qui
            n&apos;avaient pu être partagées équitablement). Si le joueur rentre
            seul, il peut récupérer les étoiles (artefacts) révélés. Puis, il
            met ses ors dans son coffre, elles sont protégées et ne peuvent plus
            être perdues. <br />
            <br /> L&apos;expédition continue jusqu&apos;à ce que tous les
            joueurs soient rentrés ou s&apos;arrête dès que deux cartes piège
            identiques apparaissent. Si l&apos;expédition s&apos;est arrêtée à
            cause de deux cartes Piège identiques, l&apos;une des cartes Piège
            identiques est retirée du paquet de carte. Les cartes reliques
            (artefacts) restantes dans le paquet sont retirées. <br />
            <br /> Après 5 expéditions, chaque or dans le coffre vaut 1 point,
            les étoiles (artefacts) valent 5 points chacune. Les 2 dernières
            étoiles (artefacts) valent 5 points supplémentaires. Le joueur avec
            le plus de points gagne. En cas d&apos;égalité le joueur avec le
            plus d&apos;étoiles (artéfacts) gagne.
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render game credits.
   */
  const renderCredits = () => {
    return (
      <div className="home--container">
        <h3> CRÉDITS </h3>
        <div className="div-home--row--rules-desc">
          Créé et développé par Gajenthran PANCHALINGAMOORTHY.
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
        <div className="home-screen">
          <div className="div-home">
            <div className="div-home--row">
              {renderGame()}
              {renderRules()}
            </div>
            <div className="div-home--row--credits-list">
              {renderCredits()}
              <div className="home--container"> </div>
            </div>
          </div>
      </div>
    </>
  )
}

export default Home
