const localStorage = window.localStorage
const USER_KEY = 'user_info'

export function getUser () {
  return JSON.parse(localStorage.getItem(USER_KEY))
}

export function saveUser (data) {
  localStorage.setItem(USER_KEY, JSON.stringify(data))
}

export function removeUser () {
  localStorage.removeItem(USER_KEY)
}
