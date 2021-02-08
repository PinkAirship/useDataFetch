import React from 'react'
import { waitFor } from '@testing-library/react'

import { render } from './test-utils'
import {
  MakeMethodDefinedCachedGet,
  MakeCallDefinedCachedGet,
  MakeMethodDefinedCachedGetFalse,
  MakeCallDefinedCachedGetFalse,
  MakeRandomGet,
} from '../example/App'

it('returns different random id with each button press', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeRandomGet show={show} />)
  const button = await findByText(/Make Random Get/)
  button.click()
  button.click()
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(3)
    expect(show.mock.calls[0][0].data).not.toEqual(
      show.mock.calls[1][0].data
    )
    expect(show.mock.calls[1][0].data).not.toEqual(
      show.mock.calls[2][0].data
    )
  })
})

it('returns same random id with each button press with useCache = true at context level', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeRandomGet show={show} />, {
    useCache: true,
  })
  const button = await findByText(/Make Random Get/)
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(1)
  })

  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(2)
  })
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toEqual(
      show.mock.calls[1][0].data
    )
  })
})

it('returns same random id with each button press with useCache = true at method level', async () => {
  const show = jest.fn()
  const { findByText } = render(
    <MakeMethodDefinedCachedGet show={show} />,
    {
      useCache: false,
    }
  )
  const button = await findByText(/Make Cached Get/)
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(1)
  })

  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(2)
  })
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toEqual(
      show.mock.calls[1][0].data
    )
  })
})

it('returns same random id with each button press with useCache = true at call level', async () => {
  const show = jest.fn()
  const { findByText } = render(
    <MakeCallDefinedCachedGet show={show} />,
    {
      useCache: false,
    }
  )
  const button = await findByText(/Make Cached Get/)
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(1)
  })

  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(2)
  })
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toEqual(
      show.mock.calls[1][0].data
    )
  })
})

it('returns different random id with each button press with useCache = true at context level but override at method', async () => {
  const show = jest.fn()
  const { findByText } = render(
    <MakeMethodDefinedCachedGetFalse show={show} />,
    {
      useCache: true,
    }
  )
  const button = await findByText(/Make Cached Get/)
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(1)
  })

  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(2)
  })
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).not.toEqual(
      show.mock.calls[1][0].data
    )
  })
})

it('returns different random id with each button press with useCache = true at context level but override at call', async () => {
  const show = jest.fn()
  const { findByText } = render(
    <MakeCallDefinedCachedGetFalse show={show} />,
    {
      useCache: true,
    }
  )
  const button = await findByText(/Make Cached Get/)
  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(1)
  })

  button.click()
  await waitFor(() => {
    expect(show).toHaveBeenCalledTimes(2)
  })
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).not.toEqual(
      show.mock.calls[1][0].data
    )
  })
})
