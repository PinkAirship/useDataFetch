import React from 'react'
import { render as baseRender } from '@testing-library/react'
import '@testing-library/jest-dom'

import { DataFetchProvider } from '../src/contexts/data-fetch-provider'
import { makeMockAxios } from '../example/App'

export function render(ui, props = {}, renderOptions = {}) {
  return baseRender(
    <DataFetchProvider
      makeMockDataFetchInstance={makeMockAxios}
      {...props}
    >
      {ui}
    </DataFetchProvider>,
    renderOptions
  )
}
