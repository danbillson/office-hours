import styled from 'styled-components'

export default styled.button`
  padding: ${({ small }) => (small ? '4px 8px ' : '6px 12px')};
  border-radius: 6px;
  border: none;
  font-size: 18px;
  width: fit-content;
  cursor: pointer;

  ${({ theme, colour }) => theme[colour]}
`
