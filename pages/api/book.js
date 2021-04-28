import {
  Call,
  Collection,
  Create,
  Delete,
  Function as Fn,
  Get,
  Index,
  Intersection,
  Match,
  Select,
} from 'faunadb'
import faunaClient from '../../lib/fauna'

export default async function handle(req, res) {
  const { user, date, time } = req.body

  if (req.method === 'DELETE') {
    try {
      const { data: deletedBooking } = await faunaClient.query(
        Delete(
          Select(
            'ref',
            Get(
              Intersection(
                Match(Index('bookings_by_user'), Call(Fn('getUser'), user)),
                Match(Index('bookings_by_date'), date)
              )
            )
          )
        )
      )
      return res.json(deletedBooking)
    } catch (error) {
      return res.status(500).json(error?.message)
    }
  }

  const data = {
    user: Call(Fn('getUser'), user),
    date,
    time,
  }

  try {
    const { data: bookingData } = await faunaClient.query(
      Create(Collection('bookings'), { data })
    )

    res.json(bookingData)
  } catch (error) {
    return res.status(500).json(error?.message)
  }
}
