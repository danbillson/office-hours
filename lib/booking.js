const stringToArray = (str) => str.split(',').filter(Boolean).map(Number)

const arrayToString = (arr) => arr.join(',')

const idsToUsers = (ids, users) =>
  stringToArray(ids).map((id) => users.find((user) => user.id === id))

export const formatTimes = ({ morning, afternoon, fullDay, ...date }) => ({
  ...date,
  morning: stringToArray(morning),
  afternoon: stringToArray(afternoon),
  fullDay: stringToArray(fullDay),
})

export const formatTimesWithUsers = (
  { morning, afternoon, fullDay, ...date },
  users
) => ({
  ...date,
  morning: idsToUsers(morning, users),
  afternoon: idsToUsers(afternoon, users),
  fullDay: idsToUsers(fullDay, users),
})
