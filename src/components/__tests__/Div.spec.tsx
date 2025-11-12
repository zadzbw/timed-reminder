import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'

describe('tailwind test', () => {
  it('should render with correct style', async () => {
    const screen = render(
      <div id="test-div" className="m-4 flex">
        test
      </div>,
    )
    const div = screen.getByText(/test/i)
    const divEl = div.element()

    expect(getComputedStyle(divEl).display).toEqual('flex')
    expect(getComputedStyle(divEl).margin).toEqual('16px')
    expect(divEl.id).toEqual('test-div')

    await expect.element(div).toHaveTextContent('test')
    expect(1).toEqual(1)
  })
})
