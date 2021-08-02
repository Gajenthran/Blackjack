const Game = require('./game')
const { hasUser, getUserIndex, getUsersInRoom, getUser } = require('./users')

const ROOM_LIMIT = 8
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
 * Class representing the ginho engine.
 */
class Ginho {
  /**
   * Create ginho engine.
   */
  constructor() {
    this.users = []
    this.game = new Map()
  }

  /**
   * Launch the game, by getting users in the room,
   * initialize game state, and game options from the lobby.
   *
   * @param {object} io - io
   * @param {object} socket - socket io
   * @param {object} options - game options
   */
  startGame(io, socket, options) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    const users = getUsersInRoom(this.users, user.room)

    if (this.game.get() !== undefined)
      return { error: 'Cannot create the game: the room is already in game.' }

    this.game.set(user.room, new Game(users, options, socket.id))
    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    const gameState = game.getGameState()
    io.to(user.room).emit('game:new-game', {
      users: game.getUsers(),
      gameState,
      options,
    })
  }

  /**
   * Launch the game, by getting users in the room and
   * initialize game state.
   *
   * @param {object} io - io
   * @param {object} socket - socket io
   * @param {object} options - game options
   */
  restartGame(io, socket) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    this.game.delete(user.room)

    io.to(user.room).emit('game:restart-response')
  }

  createLobby(io, socket, { user, room }) {
    if (!(user.name || room)) {
      return { error: 'Username and room are required.' }
    }

    if (hasUser(this.users, user.name, room)) {
      return { error: 'Username is taken.' }
    }

    user.id = socket.id
    user.room = room
    this.users.unshift(user)

    const game = this.game.get(room)

    if (game) {
      let attempt = 3
      let key = room
      while (attempt) {
        key = createRandomKey()
        if (!this.game.get(key)) break
        attempt--
      }
      if (!attempt) return { error: 'Game already created.' }
      user.room = key
    }

    socket.join(user.room)
    setTimeout(() => {
      io.to(socket.id).emit('lobby:create-response', { user })
    }, 300)
  }

  checkLobby(io, socket, { room }) {
    let error = false
    if (!room || !room.length === ROOM_LIMIT) error = true

    const roomExist = io.sockets.adapter.rooms[room] || false
    let userExist = false

    if (roomExist) userExist = io.sockets.adapter.rooms[room].sockets[socket.id]

    io.to(socket.id).emit('lobby:check-response', {
      error,
      roomExist,
      userExist,
    })
  }

  joinLobby(io, socket, { user, room }) {
    user.id = socket.id
    user.room = room
    this.users.unshift(user)
    socket.join(user.room)

    let gameStarted = false
    let gameState = null
    let options = null

    const game = this.game.get(room)

    if (game) {
      game.addUser(user)
      gameStarted = true
      gameState = { ...game.getGameState() }
      options = game.getOptions()
    }

    io.to(socket.id).emit('lobby:join-response-user', {
      user,
      users: getUsersInRoom(this.users, user.room),
      gameStarted,
      gameState,
      options,
    })

    socket.broadcast.to(user.room).emit('lobby:join-response-all', {
      users: this.users,
    })
  }

  /**
   * Remove user from the lobby or the game.
   *
   * @param {object} io - io
   * @param {object} socket - socket io
   */
  removeUser(io, socket) {
    const index = this.users.findIndex((user) => user.id === socket.id)

    const user = this.users[index]

    if (index > -1) {
      const room = user.room
      const game = this.game.get(room)
      if (game) {
        game.removeUser(user.id)
        if (game.getUsers().length === 0) this.game.delete(room)
        // this.updateGame(io, game, room, game.allChecked())
        this.users.splice(index, 1)

        io.to(user.room).emit('game:disconnect', {
          users: getUsersInRoom(game.getUsers(), user.room),
        })
      } else {
        this.users.splice(index, 1)
        io.to(user.room).emit('game:disconnect', {
          users: getUsersInRoom(this.users, room),
        })
      }
    }
  }

  // TODO: clear all users in the lobby
  removeAllUser() {
    this.users = []
  }

  /**
   * Update user action.
   *
   * @param {object} io - io
   * @param {object} socket - socket io
   * @param {*} action - user action
   */
  updateAction(io, socket, { action }) {
    const index = getUserIndex(this.users, socket.id)
    const user = this.users[index]

    if (!user) {
      return { error: "User don't exist." }
    } else {
      if (user.checked) {
        console.log("You can't two times in the same round.")
        return { error: "You can't two times in the same round." }
      }
    }

    const game = this.game.get(user.room)

    if (!game || game === null) {
      console.log('Game is not existing.')
      return { error: 'Game is not existing.' }
    }

    const allChecked = game.updateAction(socket.id, action)

    io.to(user.room).emit('game:update-action-response', {
      users: game.getUsers(),
      gameState: game.getGameState(),
      card: game.getLastCard(socket.id),
    })

    if (allChecked) {
      game.resetCountdown()
      game.clearCountdown()
      const timer = game.getTimer()
      io.to(user.room).emit('game:countdown-tick', game.getTimer())
      game.setCountdown(() => {
        io.to(user.room).emit('game:countdown-tick', game.getTimer())
        const done = game.updateJudge()

        io.to(user.room).emit('game:update-judge', {
          users: game.getUsers(),
          gameState: game.getGameState(),
        })
        if (done) {
          game.updateGame()
          game.clearCountdown()
          io.to(user.room).emit('game:update-game', {
            users: game.getUsers(),
            gameState: game.getGameState(),
          })

          setTimeout(() => {
            const end = game.newRound()
            if (end) {
              game.rankUsers()
              io.to(user.room).emit('game:end-game', {
                users: game.getUsers(),
                gameState: game.getGameState(),
              })
            } else {
              io.to(user.room).emit('game:new-round', {
                users: game.getUsers(),
                gameState: game.getGameState(),
              })
            }
          }, 3000)
        }
      }, timer.end - timer.start)
    }
  }

  updateBet(io, socket, { bet }) {
    const index = getUserIndex(this.users, socket.id)
    const user = this.users[index]

    if (!user) {
      return { error: "User don't exist." }
    } else {
      if (user.checked) {
        console.log("You can't two times in the same round.")
        return { error: "You can't two times in the same round." }
      }
    }

    const game = this.game.get(user.room)

    if (!game || game === null) {
      console.log('Game is not existing.')
      return { error: 'Game is not existing.' }
    }

    game.bet(socket.id, bet)
    game.nextPlayer()
    const users = game.getUsers()
    const gameState = game.getGameState()

    io.to(user.room).emit('game:update-bet-response', {
      users,
      gameState,
    })
  }

  /**
   * Check if it is the end of the game. If it
   * is the case, rank users.
   *
   * @param {object} io - io
   * @param {*} game - game engine
   * @param {*} user - user
   */
  endGame(io, game, user) {
    if (game.end()) {
      game.rankUsers()
      io.to(user.room).emit('game:end-game', { users: game.getUsers() })
    }
  }
}

module.exports = new Ginho()
