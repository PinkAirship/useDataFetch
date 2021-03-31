import React from 'react'
import { waitFor, render as baseRender } from '@testing-library/react'

import { render } from './test-utils'
import {
  MakeGet,
  MakePreloadGet,
  MakePost,
  MakePut,
  MakePatch,
  MakeDelete,
  MakeCustom,
  MakeGetWithSrAlert,
  MakeStoredGetFetch,
  MakeCustomOverwriteData,
  MakeGetWithData,
  MakeGetWithParams,
  MakeQuery,
  UseManagedArrayFetch,
  UseManagedFetch,
  UseManagedArrayFetchWithRootJson,
  AppThird,
  AppFourth,
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

it('returns successfully on Make Get with Params', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeGetWithParams show={show} />)
  const button = await findByText(/Make Get with Params/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data.config.params).toHaveProperty(
      'id',
      '1234'
    )
  })
})

it('returns successfully on Make Query', async () => {
  const show = jest.fn()
  const { findByText } = render(<MakeQuery show={show} />)
  const button = await findByText(/Make Query/)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data.config.params).toHaveProperty(
      'id',
      'query-1234'
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

it('creates divs with ids when clicked for Make Stored Get Fetch', async () => {
  const show = jest.fn()
  const { findByText, queryAllByText } = render(
    <MakePreloadGet show={show} />
  )

  const button = await findByText(/Make Preload Get Refetch/)
  const createdIdNodes = queryAllByText(/Created id/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  await waitFor(() => {
    expect(show.mock.calls[0][0].data).toHaveProperty(
      'user.id',
      'my-id'
    )
  })
  expect(queryAllByText(/Created id/)).toHaveLength(2)
})

it('creates divs with ids when clicked for Make Random Get and provider defines stored data', async () => {
  const { findByText, queryAllByText } = baseRender(<AppThird />)
  const createdIdNodes = queryAllByText(/Created id/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(0)
  const button = await findByText(/Make Random Get/)
  button.click()
  await findByText(/Created id/)
})

it('updates state when loading - success', async () => {
  const { findByText, findAllByText, queryAllByText } = baseRender(
    <AppFourth />
  )
  const pending = queryAllByText(/Request State/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(pending).toHaveLength(2)
  const button = await findByText(/Make Get - Success/)
  button.click()
  const running = await findAllByText(/running/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(running).toHaveLength(1)
  const success = await findAllByText(/success/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(success).toHaveLength(1)
})

it('updates state when loading - error', async () => {
  const { findByText, findAllByText, queryAllByText } = baseRender(
    <AppFourth />
  )
  const pending = queryAllByText(/Request State/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(pending).toHaveLength(2)
  const button = await findByText(/Make Get - Error/)
  button.click()
  const running = await findAllByText(/running/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(running).toHaveLength(1)
  const error = await findAllByText(/error/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(error).toHaveLength(1)
})

it('creates divs with ids when posting using use-fetched-array', async () => {
  const { findByText, queryAllByText } = render(
    <UseManagedArrayFetch />
  )
  const button = await findByText(/Make Managed Array State Post/)
  const createdIdNodes = queryAllByText(/id:/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  const node = await findByText(/I was created via a post!/)
  expect(node).toBeInTheDocument()
  expect(queryAllByText(/id:/)).toHaveLength(2)
})

it('updates divs with ids when putting using use-fetched-array', async () => {
  const { findByText, queryAllByText } = render(
    <UseManagedArrayFetch />
  )
  const button = await findByText(/Make Managed Array State Put/)
  const createdIdNodes = queryAllByText(/id:/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  const node = await findByText(/I changed via a put!/)
  expect(node).toBeInTheDocument()
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(queryAllByText(/id:/)).toHaveLength(1)
})

it('updates divs with ids when patching using use-fetched-array', async () => {
  const { findByText, queryAllByText } = render(
    <UseManagedArrayFetch />
  )
  const button = await findByText(/Make Managed Array State Patch/)
  const createdIdNodes = queryAllByText(/id:/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  const node = await findByText(/I changed via a patch!/)
  expect(node).toBeInTheDocument()
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(queryAllByText(/id:/)).toHaveLength(1)
})

it('removes divs with ids when destroying using use-fetched-array', async () => {
  const { findByText, queryAllByText } = render(
    <UseManagedArrayFetch />
  )
  const button = await findByText(/Make Managed Array State Destroy/)
  const createdIdNodes = queryAllByText(/id:/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  await findByText(/Make Managed Array State Destroy/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(queryAllByText(/id:/)).toHaveLength(0)
})

it('removes divs with ids when destroying using use-fetched-array', async () => {
  const { findByText, queryAllByText } = render(
    <UseManagedArrayFetch />
  )
  const button = await findByText(/Make Managed Array State Update/)
  const createdIdNodes = queryAllByText(/id:/)
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(createdIdNodes).toHaveLength(1)
  button.click()
  const node = await findByText(
    /I am created without a trip to the server!/
  )
  expect(node).toBeInTheDocument()
})

it('gets the data from the server correctly when root json used', async () => {
  const { findByText, queryByText } = render(
    <UseManagedArrayFetchWithRootJson />
  )
  await findByText(/With a Root Json object/)
  expect(queryByText(/id:/)).toBeInTheDocument()
})

it('gets the data from the server', async () => {
  const { findByText, queryByText } = render(<UseManagedFetch />)
  await findByText(/Make Managed State Post/)
  expect(queryByText(/myId/)).toBeInTheDocument()
})

it('posts the data to the server', async () => {
  const { findByText, queryByText } = render(<UseManagedFetch />)
  const button = await findByText(/Make Managed State Post/)
  button.click()
  await findByText(/Make Managed State Post/)
  expect(queryByText(/Hi\sthere!/)).toBeInTheDocument()
})

it('puts the data to the server', async () => {
  const { findByText, queryByText } = render(<UseManagedFetch />)
  const button = await findByText(/Make Managed State Post/)
  button.click()
  await findByText(/Make Managed State Put/)
  expect(queryByText(/id:/)).toBeInTheDocument()
})

it('patches the data to the server', async () => {
  const { findByText, queryByText } = render(<UseManagedFetch />)
  const button = await findByText(/Make Managed State Patch/)
  button.click()
  await findByText(/Make Managed State Put/)
  expect(queryByText(/id:/)).toBeInTheDocument()
})

it('destroys the data', async () => {
  const { findByText, queryByText } = render(<UseManagedFetch />)
  const button = await findByText(/Make Managed State Destroy/)
  button.click()
  await findByText(/Make Managed State Destroy/)
  expect(queryByText(/myId/)).not.toBeInTheDocument()
})
