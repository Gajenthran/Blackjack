export const NB_AVATARS = 25

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

let avatarImgs = new Array(NB_AVATARS)

for (let i = 0; i < NB_AVATARS; i++) {
  avatarImgs[i] = require(`./../../assets/img/avatar-${i + 1}.png`)
}

avatarImgs = shuffle(avatarImgs)

export const userAvatar = {
  avatars: avatarImgs,
  leftArrow: require('./../../assets/img/left-arrow.png'),
  rightArrow: require('./../../assets/img/right-arrow.png'),
}
