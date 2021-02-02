import React from 'react';
import { render, waitFor } from '@testing-library/react';

import {
  MakeGet,
  MakePost,
  MakePut,
  MakePatch,
  MakeDelete,
  MakeCustom,
  MakeGetWithSrAlert,
  MakeStoredGetFetch,
  makeMockAxios
} from '../example/App'
import { DataFetchProvider } from "../src/contexts/data-fetch-provider";

export function renderComponent(children, props = {}) {
  return {
    ...render(
      <DataFetchProvider makeMockDataFetchInstance={makeMockAxios} {...props}>
        {children}
      </DataFetchProvider>
    )
  };
}

it('renders a Make Get Button', async () => {
  const { findByText } = renderComponent(<MakeGet />);
  await findByText(/Make Get/);
});

it('returns successfully on Make Get', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakeGet show={show}/>);
  const button = await findByText(/Make Get/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('user.id', 'my-id')})
});

it('returns successfully on Make Post', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakePost show={show}/>);
  const button = await findByText(/Make Post/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('message', 'my data')})
});

it('returns successfully on Make Put', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakePut show={show}/>);
  const button = await findByText(/Make Put/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('message', 'different data')})
});

it('returns successfully on Make Patch', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakePatch show={show}/>);
  const button = await findByText(/Make Patch/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('message', 'more different data')})
});

it('returns successfully on Make Delete', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakeDelete show={show}/>);
  const button = await findByText(/Make Delete/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('message', 'id')})
});

it('returns successfully on Make Custom', async () => {
  const show = jest.fn();
  const { findByText } = renderComponent(<MakeCustom show={show}/>);
  const button = await findByText(/Make Custom/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('message', 'my-custom-message')})
});

it('returns successfully on Make Get with Sr Alert', async () => {
  const show = jest.fn()
  const screenReaderAlert = jest.fn()
  const { findByText } = renderComponent(<MakeGetWithSrAlert show={show}/>, { screenReaderAlert });
  const button = await findByText(/Make Get And Alert Screen Reader/);
  button.click()
  await waitFor(() => {expect(show.mock.calls[0][0].data).toHaveProperty('user.id', 'my-id')})
  await waitFor(() => {expect(screenReaderAlert.mock.calls[0][0]).toEqual('Messages Came')})
});

it('creates divs with ids when clicked for Make Stored Get Fetch', async () => {
  const { findByText, queryAllByText } = renderComponent(<MakeStoredGetFetch />);
  const createdIdNodes = await queryAllByText(/Created id/)
  expect(createdIdNodes).toHaveLength(0)
  const button = await findByText(/Make Stored Get/);
  button.click()
  await findByText(/Created id/);
});
