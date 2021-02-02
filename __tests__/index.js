import React from 'react';
import { render } from '@testing-library/react';

import { MakeGet } from '../example/App'
import { DataFetchProvider } from "../src/contexts/data-fetch-provider";

export function renderComponent(children, props = {}) {
  return {
    ...render(
      <DataFetchProvider {...props}>
        {children}
      </DataFetchProvider>
    )
  };
}

it('renders a Make Get Button', async () => {
  const { findByText } = renderComponent(<MakeGet />);
  await findByText(/Make Get/);
});
