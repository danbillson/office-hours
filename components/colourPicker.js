import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import styled from 'styled-components'
import { BiPalette } from 'react-icons/bi'
import { useClickAway } from 'react-use'
import { colours, randomHex } from '../lib/colours'

const updateColour = (time, userName, colour) =>
  time.map((user) => (user.name === userName ? { ...user, colour } : user))

export default function ColourPicker({ user, week }) {
  const modalRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  useClickAway(modalRef, () => setShowModal(false))

  const queryClient = useQueryClient()
  const queryKey = `/api/dates/${week}`

  const { mutate: changeColour } = useMutation(
    (colour) => axios.post('/api/colour', { user, colour }),
    {
      onMutate: async (colour) => {
        await queryClient.cancelQueries(queryKey)
        const previousBookings = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old) =>
          old.map((oldDate) => ({
            ...oldDate,
            am: updateColour(oldDate.am, user, colour),
            pm: updateColour(oldDate.pm, user, colour),
            day: updateColour(oldDate.day, user, colour),
          }))
        )

        return { previousBookings }
      },
      onError: (err, newBooking, context) => {
        queryClient.setQueryData(queryKey, context.previousBookings)
      },
    }
  )

  return (
    <Container>
      <Palette onClick={() => setShowModal(true)} />
      {showModal ? (
        <Colours ref={modalRef}>
          {Object.entries(colours).map(([colour, hex]) => (
            <Colour
              key={colour}
              colour={hex}
              onClick={() => changeColour(colour)}
            />
          ))}
        </Colours>
      ) : null}
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

const circleStyles = Array.from({ length: 4 })
  .map((_, i) => `circle:nth-child(${i + 2}) { color: ${randomHex()}; }`)
  .join('\n')

const Palette = styled(BiPalette)`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.black};
  cursor: pointer;

  ${circleStyles}
`

const Colours = styled.div`
  position: absolute;
  right: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 8px;
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25), 0 2px 2px rgba(0, 0, 0, 0.2),
    0 4px 4px rgba(0, 0, 0, 0.15), 0 8px 8px rgba(0, 0, 0, 0.1),
    0 16px 16px rgba(0, 0, 0, 0.05);
`

const Colour = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${({ colour }) => colour};
  border-radius: 3px;
  cursor: pointer;
`
