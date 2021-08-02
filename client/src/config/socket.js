import openSocket from 'socket.io-client'

/**
 * Endpoint for socket, to emit values to the server.
 */
// const ENDPOINT = 'http://localhost:8080'
const ENDPOINT = "https://blackjack--app.herokuapp.com/";

const socket = openSocket(ENDPOINT)

export default socket
