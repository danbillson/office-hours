import { Update, Call, Function as Fn } from 'faunadb'
import faunaClient from '../../lib/fauna'

export default async function handle(req, res) {
  const { user, colour } = req.body

  try {
    const { data: userData } = await faunaClient.query(
      Update(Call(Fn('getUser'), user), {
        data: { colour },
      })
    )

    res.json(userData)
  } catch (error) {
    res.status(500).json(error)
  }
}
