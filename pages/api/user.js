import { Get, Create, Collection, Call, Function as Fn } from 'faunadb'
import faunaClient from '../../lib/fauna'

export default async function handle(req, res) {
  const { name } = req.body

  if (!name || name.length < 3) {
    return res.status(400).json({ message: 'Please provide your name' })
  }

  try {
    const { data: userData } = await faunaClient.query(
      Get(Call(Fn('getUser'), name))
    )
    return res.json(userData)
  } catch (error) {}

  try {
    const { data: newUser } = await faunaClient.query(
      Create(Collection('users'), {
        data: {
          ...req.body,
        },
      })
    )

    return res.json(newUser)
  } catch (error) {
    res.status(500).json(error)
  }
}
