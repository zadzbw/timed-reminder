import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { Counter } from '../Counter'

describe('`Counter` component test', () => {
  it('should render with initial value', async () => {
    const { getByRole } = render(<Counter />)
    const el = getByRole('button')

    expect(el).toBeInTheDocument()
    expect(el).toHaveTextContent('count is 0')
  })

  it('should increment count on click', async () => {
    const { getByRole } = render(<Counter />)
    const el = getByRole('button')

    // click 1
    await el.click()
    expect(el).toHaveTextContent('count is 1')

    // click 2
    await el.click()
    expect(el).toHaveTextContent('count is 2')
  })
})
