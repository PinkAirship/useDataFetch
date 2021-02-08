import React from 'react'
import { waitFor } from '@testing-library/react'

import { render } from './test-utils'
import {
  MakeGet,
  MakePost,
  MakePut,
  MakePatch,
  MakeDelete,
  MakeCustom,
  MakeGetWithSrAlert,
  MakeStoredGetFetch,
  MakeCustomOverwriteData,
  MakeGetWithData,
} from '../example/App'

it('renders a Make Get Button', async () => {
  const { findByText } = render(<MakeGet />)
  await findByText(/Make Get/)
})

it('returns successfully on Make Get', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeGet show={show} />)
  const button = await findByText(/Make Get/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'user.id',
      'my-id'
    )
  })
})

it('returns successfully on Make Get with Data', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeGetWithData show={show} />)
  const button = await findByText(/Make Get with Data/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'my message of get'
    )
  })
})

it('returns successfully on Make Post', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakePost show={show} />)
  const button = await findByText(/Make Post/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'my data'
    )
  })
})

it('returns successfully on Make Put', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakePut show={show} />)
  const button = await findByText(/Make Put/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'different data'
    )
  })
})

it('returns successfully on Make Patch', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakePatch show={show} />)
  const button = await findByText(/Make Patch/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'more different data'
    )
  })
})

it('returns successfully on Make Delete', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeDelete show={show} />)
  const button = await findByText(/Make Delete/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty('message', 'id')
  })
})

it('returns successfully on Make Custom', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeCustom show={show} />)
  const button = await findByText(/Make Custom/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'my-custom-message'
    )
  })
})

it('overwrites data successfully on Make Custom', async () => {
  const show = jest.fn()
  const { findByText } = render(
    <MakeCustomOverwriteData show={show} />
  )
  const button = await findByText(/Make Custom/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'message',
      'overwritten data'
    )
  })
})

it('returns successfully on Make Get with Sr Alert', async () => {
  const show = jest.fn()
  const screenReaderAlert = jest.fn()
  const { findByText } = render(<MakeGetWithSrAlert show={show} />, {
    screenReaderAlert,
  })
  const button = await findByText(/Make Get And Alert Screen Reader/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'user.id',
      'my-id'
    )
  })
  await waitFor(() => {
    expect(screenReaderAlert.mock.calls[0][0]).toEqual(
      'Messages Came'
    )
  })
})

it('creates divs with ids when clicked for Make Stored Get Fetch', async () => {
  const { findByText, queryAllByText } = render(
    <MakeStoredGetFetch />
  )
  const createdIdNodes = queryAllByText(/Created id/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(0)
  const button = await findByText(/Make Stored Get/)
  button.click()
  await findByText(/Created id/)
})
