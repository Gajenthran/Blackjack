import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'

import socket from './../../config/socket'

import './../Home/Home.css'
import { userAvatar, NB_AVATARS } from './../Home'
import { IMGS } from '../constants/images'

/**
 * Home component to create an user and a lobby.
 * There is also game rules.
 */
const Profile = ({ location }) => {
  const [name, setName] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const { room } = queryString.parse(location.search)

  const onJoinLobby = () => {
    const user = { name, img: userAvatar.avatars[avatarIndex] }
    if (name.length !== 0) socket.emit('lobby:join', { user, room })
  }

  const renderAvatar = () => {
    return (
      <div className="div-home--avatar">
        <img
          className="avatar-img"
          src={userAvatar.avatars[avatarIndex]}
          alt="avatar-img"
        />
        <img
          className="avatar-left-arrow"
          src={IMGS['leftArrow']}
          alt="left-arrow-img"
          onClick={() =>
            setAvatarIndex(
              avatarIndex - 1 < 0 ? NB_AVATARS - 1 : avatarIndex - 1
            )
          }
        />
        <img
          className="avatar-right-arrow"
          src={IMGS['rightArrow']}
          alt="right-arrow-img"
          onClick={() => setAvatarIndex((avatarIndex + 1) % NB_AVATARS)}
        />
        <input
          placeholder="Entrez votre nom"
          type="text"
          onChange={(event) => setName(event.target.value)}
        />
        <Link
          onClick={() => onJoinLobby()}
          to={name.length !== 0 ? `/game?room=${room}` : '/'}
        >
          <button type="submit"> REJOINDRE </button>
        </Link>
      </div>
    )
  }

  const onRedirectGithub = () => {
    window.location = 'https://github.com/Gajenthran'
  }

  const renderFooter = () => {
    return (
      <div className="home--footer">
        <p onClick={() => onRedirectGithub()}> GITHUB </p>
      </div>
    )
  }

  const onReturnHome = () => {
    window.location = '/'
  }

  return (
    <>
      <div className="home-screen">
        <div className="div-home">
          <div className="home--container">
            <h3 className="home--title" onClick={() => onReturnHome()}>
              BLACKJACK
            </h3>
            {renderAvatar()}
            {renderFooter()}
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
