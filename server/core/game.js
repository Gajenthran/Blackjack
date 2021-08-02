const fs = require('fs')
const path = require('path')
const { getUserIndex } = require('./users')

const ACTION = {
  leave: 0,
  draw: 1,
  double: 2,
}

const CARDS_TYPE = {
  as: 0,
  normal: 1,
  joker: 2,
}

const COUNTDOWN = 1000 * 2 // milliseconds

/**
 * Default multiplicator for the game.
 */
const BLACKJACK = 21
const BLACKJACK_VALUE = 50
const MAX_JUDGE_VALUE = 17
const STATE = {
  bet: 0,
  play: 1,
  judge: 2,
  end: 3,
}

const NB_ROUND = 3
/**
 * Get all cards from cards.json
 */
const CARDS_JSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/cards.json'))
)

/**
 * Get cards property from cards.
 */
const CARDS = CARDS_JSON.cards

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }
}

/**
 * Class representing the game.
 */
class Game {
  /**
   * Create the game.
   *
   * @param {array} users - list of users
   * @param {object} options - game optionss
   */
  constructor(users, options) {
    this.users = users
    this.round = 1
    this.state = STATE['bet']

    this.cards = []
    this.score = 0
    this.countdown = null
    this.timer = null

    this.deck = [...CARDS]
    this.deckIndexes = Array.from(Array(this.deck.length), (_, index) => index)
    shuffleDeck(this.deckIndexes)

    this.firstPlayer = Math.floor(Math.random() * (this.users.length - 1))
    this.currentPlayer = this.firstPlayer

    // nbRound, nbPlayer, x2Stars, duplicate, mult
    this.options = options

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].checked = false
      this.users[i].cards = []
      this.users[i].alive = true
      this.users[i].score = 0
      this.users[i].bet = 0
      this.users[i].gold = 100
      this.users[i].currentGold = -1
    }
  }

  getLastCard(id) {
    const index = getUserIndex(this.users, id)
    const user = this.users[index]

    return user.cards[-1]
  }

  newRound() {
    if (this.round === NB_ROUND) {
      return true
    }

    this.round++
    this.state = STATE['bet']
    this.firstPlayer = (this.firstPlayer + 1) % this.users.length
    this.currentPlayer = this.firstPlayer
    shuffleDeck(this.deckIndexes)

    this.countdown = null
    this.timer = null

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].checked = false
      this.users[i].cards = []
      this.users[i].alive = true
      this.users[i].score = 0
      this.users[i].bet = 0
      this.users[i].currentGold = -1
    }

    this.cards = []
    this.score = 0

    return false
  }

  nextPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.users.length

    if (this.currentPlayer === this.firstPlayer) {
      this.state++
      if (this.state === STATE['play']) {
        this.users.map((usr) => (usr.checked = false))
        for (let i = 0; i < this.users.length; i++) {
          for (let c = 0; c < 2; c++)
            this.users[i].cards.push(this.deck[this.deckIndexes.pop()])
          this.users[i].score = this.cardsScore(this.users[i].cards)
        }
        this.cards.push(this.deck[this.deckIndexes.pop()])
        this.score = this.cardsScore(this.cards)
      }
    }
  }

  bet(id, gold) {
    const index = getUserIndex(this.users, id)
    const user = this.users[index]

    user.bet = gold
    user.gold -= gold
    user.checked = true
  }

  drawCard(user) {
    user.cards.push(this.deck[this.deckIndexes.pop()])
    user.score = this.cardsScore(user.cards)

    if (user.score > BLACKJACK) {
      user.alive = false
      user.checked = true
    }
  }

  doubleCard(user) {
    if (user.cards.length > 2) return

    user.cards.push(this.deck[this.deckIndexes.pop()])
    user.score = this.cardsScore(user.cards)
    user.gold -= user.bet
    user.bet *= 2
    user.checked = true

    if (user.score > BLACKJACK) user.alive = false
  }

  leave(user) {
    if (!user.alive || user.checked) return

    user.checked = true
  }

  updateJudge() {
    if (this.score >= MAX_JUDGE_VALUE) return true

    const card = this.deck[this.deckIndexes.pop()]
    this.cards.push(card)
    this.score = this.cardsScore(this.cards)

    if (this.score >= MAX_JUDGE_VALUE) return true

    return false
  }

  blackjack(cards) {
    if (cards.length !== 2) return false
    return cards[0].score + cards[1].score === BLACKJACK
  }

  cardsScore(cards) {
    let score_ = 0

    let nbAsCards = cards.filter(
      (card) => card.type === CARDS_TYPE['as']
    ).length

    cards.map((card) => (score_ += card.score))

    while (nbAsCards > 0) {
      if (score_ > BLACKJACK) {
        score_ -= 10
        nbAsCards--
      } else {
        break
      }
    }

    return score_
  }

  updateGame() {
    const blackjacked = this.blackjack(this.cards)
    for (let i = 0; i < this.users.length; i++) {
      if (!this.users[i].alive) continue

      const user = this.users[i]
      const userBJ = this.blackjack(user.cards)
      let gold = null
      if (this.score > BLACKJACK) {
        gold = user.bet * 2
      } else {
        if (blackjacked) {
          gold = userBJ ? user.bet : 0
        } else {
          gold =
            user.score > this.score || userBJ
              ? user.bet * 2
              : user.score === this.score
              ? user.bet
              : 0
        }
      }

      user.currentGold = gold ? (userBJ ? gold + BLACKJACK_VALUE : gold) : gold
      user.gold += user.currentGold
      user.alive = gold ? true : false
    }
  }

  /**
   * Count played users and remaining users.
   */
  _countPlayedUsers() {
    let played = 0
    let remaining = 0
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].checked) played++
      if (this.users[i].left !== true) remaining++
    }

    return { played, remaining }
  }

  /**
   * Check if there is a duplicate card.
   *
   * @param {object} card - card
   */
  _hasDuplicates(card) {
    for (let i = 0; i < this.deck.length; i++)
      if (this.deck[i].name === card.name) return true
    return false
  }

  /**
   * Get the remaining user.
   */
  _remainingUser() {
    return this.users.filter((user) => user.left !== true)
  }

  /**
   * Get all leaving users.
   *
   * @param {array} users - user
   */
  _leavingUsers(users) {
    return users.filter((user) => user.action === LEAVE)
  }

  /**
   * Check if all user have played.
   */
  allChecked() {
    return this.playedUser === this.remainingUsers
  }

  /**
   * Check if the game is over.
   */
  end() {
    return this.round > this.options.nbRound
  }

  /**
   * Get game options.
   */
  getOptions() {
    return this.options
  }

  /**
   * Get game state.
   */
  getGameState() {
    return {
      round: this.round,
      nbCards: this.deck.length,
      cards: this.cards,
      score: this.score,
      currentPlayer: this.users[this.currentPlayer].id,
      state: this.state,
    }
  }

  /**
   * Check if the game has a user.
   */
  hasUser() {
    return this.users.length > 0
  }

  /**
   * Check if there is a remaining user in a round.
   */
  hasRemainingUsers() {
    return this.remainingUsers !== 0
  }

  getUsers() {
    return this.users
  }

  checkAllLeaving() {
    for (let u = 0; u < this.users.length; u++) {
      if (this.users[u].action === CONTINUE) return false
    }
    return true
  }

  /**
   * Rank users by number of gold.
   */
  rankUsers() {
    this.users.sort((u1, u2) => (u1.gold < u2.gold ? 1 : -1))
  }

  /**
   * Update user.
   *
   * @param {string} id - user id
   * @param {number} action - user action
   */
  updateAction(id, action) {
    const index = getUserIndex(this.users, id)
    const user = this.users[index]

    switch (action) {
      case ACTION['leave']:
        this.leave(user)
        break
      case ACTION['draw']:
        this.drawCard(user)
        break
      case ACTION['double']:
        this.doubleCard(user)
        break
      default:
        console.log('Error: Inapropriate action.')
        break
    }

    if (user.checked)
      this.currentPlayer = (this.currentPlayer + 1) % this.users.length

    return !this.users.filter((usr) => usr.checked === false).length
  }

  /**
   * Add user on the game.
   *
   * @param {string} id - user id
   */
  addUser(user) {
    let index = this.users.findIndex((u) => u.id === user.id)

    if (index === -1) {
      this.users.unshift(user)
      index = 0
    }

    this.users[index].left = false
    this.users[index].checked = false
    this.users[index].action = CONTINUE
    this.users[index].gold = 100
    this.users[index].currentGold = 0
    this.users[index].lastGold = -1

    const { played, remaining } = this._countPlayedUsers()
    this.remainingUsers = remaining
    this.playedUser = played
  }

  /**
   * Remove user from the game and update the game.
   *
   * @param {string} id - user id
   */
  removeUser(id) {
    // TODO: useless but to improve
    const index = this.users.findIndex((user) => user.id === id)

    if (index !== -1) this.users.splice(index, 1)

    const { played, remaining } = this._countPlayedUsers()
    this.remainingUsers = remaining
    this.playedUser = played
  }

  setCountdown(fct, timeout) {
    this.countdown = setInterval(fct, timeout)
  }

  clearCountdown() {
    clearInterval(this.countdown)
  }

  resetCountdown() {
    const now = new Date()
    this.timer = {
      start: now.getTime(),
      end: now.getTime() + COUNTDOWN,
    }
  }

  getTimer() {
    return this.timer
  }
}

module.exports = Game
