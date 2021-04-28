import {
  Paginate,
  Match,
  Index,
  Map,
  Lambda,
  Var,
  Let,
  Select,
  Get,
} from 'faunadb'
import faunaClient from '../../../lib/fauna'
import { format, addDays, startOfWeek } from 'date-fns'

const getWeekDates = (date) => {
  const monday = startOfWeek(new Date(date), { weekStartsOn: 1 })

  return Array.from({ length: 5 }, (_, i) =>
    format(addDays(new Date(monday), i), 'dd/MM/yyyy')
  )
}

const createEmptyDate = (date) => ({
  date,
  am: [],
  pm: [],
  day: [],
})

const formatBookings = (bookings) =>
  bookings.reduce((acc, cur) => {
    const { time, user } = cur

    return {
      ...acc,
      [time]: [
        ...acc[time],
        {
          name: user.data.name,
          colour: user.data.colour,
        },
      ],
    }
  }, createEmptyDate(bookings?.[0]?.date))

export default async function handle(req, res) {
  const { date } = req.query
  const dates = getWeekDates(date)

  try {
    const doc = await faunaClient.query(
      Map(
        dates,
        Lambda(
          'date',
          Map(
            Paginate(Match(Index('bookings_by_date'), Var('date'))),
            Lambda(
              'bookingRef',
              Let(
                {
                  bookingDoc: Get(Var('bookingRef')),
                },
                {
                  date: Select(['data', 'date'], Var('bookingDoc')),
                  user: Get(Select(['data', 'user'], Var('bookingDoc'))),
                  time: Select(['data', 'time'], Var('bookingDoc')),
                }
              )
            )
          )
        )
      )
    )

    const formattedDates = doc.reduce((acc, cur, i) => {
      if (cur.data.length === 0) return [...acc, createEmptyDate(dates[i])]

      return [...acc, formatBookings(cur.data)]
    }, [])

    res.json(formattedDates)
  } catch (error) {
    res.status(500).json(error?.message)
  }
}
