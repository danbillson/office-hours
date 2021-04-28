import { Client } from 'faunadb'

let fauna

if (process.env.NODE_ENV === 'production') {
  fauna = new Client({
    secret: process.env.FAUNADB_SECRET,
  })
} else {
  if (!global.fauna) {
    global.fauna = new Client({
      secret: process.env.FAUNADB_SECRET,
    })
  }
  fauna = global.fauna
}

export default fauna
