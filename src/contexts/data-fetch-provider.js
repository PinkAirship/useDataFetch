import React from 'react'
import axios from 'axios'
import LruCache from 'lru-cache'

export const DataFetchContext = React.createContext({
  dataFetchInstance: null,
  screenReaderAlert: () => {},
})

// stable function signature for equality checks when updateStateHook is not defined
function noop() {}

function setupAxios(axiosCreateOpts) {
  const axiosInstance = axios.create(axiosCreateOpts)
  return axiosInstance
}
export function DataFetchProvider({
  children,
  dataFetchInstance = null,
  axiosCreateOpts = {},
  screenReaderAlert = () => {},
  makeMockDataFetchInstance = null,
  useCache = false,
  cacheSize = 50,
  updateStateHook = noop,
  debugCache = false,
}) {
  if (makeMockDataFetchInstance && dataFetchInstance) {
    throw 'Cannot use `makeMockDataFetchInstance` and `dataFetchInstance` together.'
  }

  if (dataFetchInstance == null) {
    dataFetchInstance = setupAxios(axiosCreateOpts)
    if (makeMockDataFetchInstance) {
      makeMockDataFetchInstance(dataFetchInstance)
    }
  }

  const cache = new LruCache(cacheSize)
  if (debugCache && window) {
    if (!window.dataFetchCaches) {
      window.dataFetchCaches = []
    }
    window.dataFetchCaches.push(cache)
  }

  const contextValue = {
    dataFetchInstance,
    screenReaderAlert,
    cache,
    useCache,
    updateStateHook,
  }

  return (
    <DataFetchContext.Provider value={contextValue}>
      {children}
    </DataFetchContext.Provider>
  )
}
