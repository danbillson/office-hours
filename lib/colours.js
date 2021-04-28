import { setSaturation, setLightness } from 'polished'

export const colours = {
  hotpink: '#fc0064',
  pink: '#e91e63',
  purple: '#8a4af3',
  midnight: '#673ab7',
  darkBlue: '#3f51b5',
  blue: '#03a9f4',
  teal: '#00bcd4',
  green: '#4caf50',
  lime: '#8bc34a',
  yellow: '#ffc107',
  orange: '#ff9800',
  fire: '#ff5722',
}

export const createColours = (colours) =>
  Object.entries(colours).reduce((acc, [name, hex]) => {
    const background = setSaturation(0.9, setLightness(0.95, hex))

    return {
      ...acc,
      [name]: `
        color: ${hex};
        background-color: ${background};
      `,
    }
  }, {})

export const randomColour = () => {
  const keys = Object.keys(colours)
  const random = Math.floor(Math.random() * keys.length)
  return keys[random]
}

export const randomHex = () => {
  const values = Object.values(colours)
  const random = Math.floor(Math.random() * values.length)
  return values[random]
}
