/**
 * Check if there is a user with the specified
 * name and room.
 *
 * @param {array} users - users
 * @param {string} name - user name
 * @param {string} room - user room
 */
const hasUser = (users, name, room) => {
  // TODO: change username to email !!
  return users.find((user) => user.room === room && user.name === name)
}

/**
 * Get the user index, with the specified
 * id.
 *
 * @param {array} users - users
 * @param {string} id - user id
 */
const getUserIndex = (users, id) => {
  for (let i = 0; i < users.length; i++) if (users[i].id === id) return i
  return -1
}

/**
 * Get all users from the specified room.
 *
 * @param {array} users - users
 * @param {string} room - room
 */
const getUsersInRoom = (users, room) => {
  return users.filter((user) => user.room === room)
}

/**
 * Get user with the specified id.
 *
 * @param {array} users - users
 * @param {*} id - user id
 */
const getUser = (users, id) => {
  return users.find((user) => user.id === id)
}

module.exports = { hasUser, getUserIndex, getUsersInRoom, getUser }
