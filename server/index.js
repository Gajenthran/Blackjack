const http = require('http')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const socketIO = require('socket.io')

const ginho = require('./core/ginho')

require('dotenv').config()

const ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8080

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(bodyParser.json())

const server = http.createServer(app)
const io = socketIO(server)
io.sockets.server.engine.pingTimeout = 15000

app.enable('trust proxy')

app.use(cors())

const publicDir = require('path').join(__dirname, '/public')
app.use(express.static(publicDir))

if (ENV === 'production') {
  app.use(express.static(path.join(__dirname, './../client/build')))
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, './../client/build/index.html'))
  })
} else {
  console.log('You are in development environment...')
}

io.on('connection', (socket) => {
  listen(io, socket, 'lobby:create', ginho.createLobby.bind(ginho))
  listen(io, socket, 'lobby:check', ginho.checkLobby.bind(ginho))
  listen(io, socket, 'lobby:join', ginho.joinLobby.bind(ginho))
  listen(io, socket, 'game:start', ginho.startGame.bind(ginho))
  listen(io, socket, 'game:update-bet', ginho.updateBet.bind(ginho))
  listen(io, socket, 'game:update-action', ginho.updateAction.bind(ginho))
  listen(io, socket, 'game:restart', ginho.restartGame.bind(ginho))
  listen(io, socket, 'disconnect', ginho.removeUser.bind(ginho))
})

function listen(io, socket, type, callback) {
  socket.on(type, (data) => {
    callback(io, socket, data)
  })
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`)
})

module.exports = app
