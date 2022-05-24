import { useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { format, parse, isPast, addDays } from 'date-fns'
import styled from 'styled-components'
import Button from './button'

const officeLimit = 12

const removeUser = (array, user) => array.filter(({ name }) => name !== user)

const excludeDogs = (array) => array.filter(({ name }) => !name.includes('🐶'))

const attendance = (array) => excludeDogs(array).length

export default function Day({ user, week, date, am, pm, day }) {
  const queryClient = useQueryClient()
  const queryKey = `/api/dates/${week}`

  const { mutate: bookDate } = useMutation(
    (time) => axios.post('/api/book', { user: user.name, date, time }),
    {
      onMutate: async (time) => {
        await queryClient.cancelQueries(queryKey)
        const previousBookings = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old) =>
          old.map((oldDate) => {
            if (oldDate.date !== date) return oldDate

            const updatedList = [...oldDate[time], user]
            return {
              ...oldDate,
              [time]: updatedList,
            }
          })
        )

        return { previousBookings }
      },
      onError: (err, newBooking, context) => {
        queryClient.setQueryData(queryKey, context.previousBookings)
      },
    }
  )

  const { mutate: deleteBooking } = useMutation(
    () => axios.delete('/api/book', { data: { user: user.name, date } }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries(queryKey)
        const previousBookings = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old) =>
          old.map((oldDate) => {
            if (oldDate.date !== date) return oldDate

            return {
              ...oldDate,
              am: removeUser(oldDate.am, user.name),
              pm: removeUser(oldDate.pm, user.name),
              day: removeUser(oldDate.day, user.name),
            }
          })
        )

        return { previousBookings }
      },
      onError: (err, newBooking, context) => {
        queryClient.setQueryData(queryKey, context.previousBookings)
      },
    }
  )

  const usableDate = parse(date, 'dd/MM/yyyy', new Date())
  const dayOfWeek = format(usableDate, 'eee')
  const dayOfMonth = format(usableDate, 'do')
  const tomorrow = addDays(usableDate, 1)

  const times = [
    { name: 'Morning', list: am },
    { name: 'Afternoon', list: pm },
    { name: 'Full day', list: day },
  ]

  const combined = [...am, ...pm, ...day]
  const noOne = combined.length === 0
  const attending = combined.map(({ name }) => name).includes(user.name)

  const totalAM = attendance(am) + attendance(day)
  const totalPM = attendance(pm) + attendance(day)
  const amAvailable = totalAM < officeLimit
  const pmAvailable = totalPM < officeLimit
  const dayAvailable = Math.max(totalAM, totalPM) < officeLimit
  const noAvailalibility = totalAM === officeLimit && totalPM === officeLimit

  return (
    <Container>
      <DayOfWeek>
        {dayOfWeek} <span>{dayOfMonth}</span>
      </DayOfWeek>
      {noOne ? (
        <Empty>No one 😢</Empty>
      ) : (
        times.map(({ name, list }) =>
          !list.length ? null : (
            <div key={name}>
              <Time>{name}</Time>
              <List>
                {list.map(({ name, colour }) => (
                  <NameTag key={name} colour={colour}>
                    {name}
                  </NameTag>
                ))}
              </List>
            </div>
          )
        )
      )}
      {isPast(tomorrow) ? null : attending ? (
        <Remove onClick={deleteBooking}>
          I don’t want to come in on this day anymore.
        </Remove>
      ) : noAvailalibility ? (
        <Add>Fully booked 😬</Add>
      ) : (
        <>
          <Add>I would like to come for the:</Add>
          <Buttons>
            {amAvailable ? (
              <Button small colour="yellow" onClick={() => bookDate('am')}>
                AM
              </Button>
            ) : null}
            {pmAvailable ? (
              <Button small colour="midnight" onClick={() => bookDate('pm')}>
                PM
              </Button>
            ) : null}
            {dayAvailable ? (
              <Button small colour="fire" onClick={() => bookDate('day')}>
                DAY
              </Button>
            ) : null}
          </Buttons>
        </>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const DayOfWeek = styled.p`
  text-align: center;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 20px;

  span {
    color: ${({ theme }) => theme.colors.grey};
  }
`

const Time = styled.p`
  font-size: 20px;
  font-weight: 600;
  margin: 8px 0;
`

const Empty = styled.p`
  font-size: 18px;
  margin: 8px 0;
  text-align: center;
`

const List = styled.div`
  padding: 16px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.grey};

  p:not(:first-child) {
    margin-top: 8px;
  }
`

const NameTag = styled.p`
  padding: 2px 4px;
  margin: 0;
  border-radius: 3px;
  font-size: 18px;
  width: fit-content;
  ${({ theme, colour }) => theme[colour]}
`

const Remove = styled.p`
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
`

const Add = styled.p`
  font-size: 14px;
`

const Buttons = styled.div`
  display: flex;

  button:not(:first-child) {
    margin-left: 4px;
  }
`
