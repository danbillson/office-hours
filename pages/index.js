import { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import axios from 'axios'
import styled from 'styled-components'
import { useLocalStorage } from 'react-use'
import Button from '../components/button'
import { randomColour } from '../lib/colours'

const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'afternoon'

export default function Home() {
  const [name, setName] = useState('')
  const [, setUser] = useLocalStorage('office-hours')
  const router = useRouter()

  const { mutate, error } = useMutation(
    () => axios.post('/api/user', { name, colour: randomColour() }),
    {
      onSuccess: ({ data }) => {
        setUser(data)
        router.push('/booking')
      },
    }
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    mutate()
  }

  return (
    <Container>
      <Heading>Climb Office Hours</Heading>
      <Main>
        <Welcome>Good {timeOfDay}!</Welcome>
        <Label htmlFor="name">What was your name again?</Label>
        <Form onSubmit={handleSubmit}>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button colour="green">Let's go</Button>
        </Form>
        {error ? <Error>Please provide your name</Error> : null}
      </Main>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Heading = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.black};
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 25vh;
`

const Welcome = styled.h2`
  margin-top: 0;
  font-size: 72px;
  letter-spacing: 2px;
`

const Label = styled.label`
  font-size: 24px;
`

const Form = styled.form`
  display: flex;
  margin-top: 12px;
`

const Input = styled.input`
  min-width: 300px;
  margin-right: 12px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 6px;
`

const Error = styled.p`
  padding: 4px 8px;
  border-radius: 3px;
  ${({ theme }) => theme.hotpink}
`
