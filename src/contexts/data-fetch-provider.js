import React from "react";
import axios from 'axios'

export const DataFetchContext = React.createContext({
  dataFetchInstance: null,
  screenReaderAlert: () => {}
});


function setupAxios(axiosCreateOpts) {
  const axiosInstance = axios.create(axiosCreateOpts)
  return axiosInstance
}
export function DataFetchProvider({
  children,
  dataFetchInstance = null,
  axiosCreateOpts = {},
  screenReaderAlert = (message) => {},
  makeMockDataFetchInstance = null
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

  const contextValue = {
    dataFetchInstance,
    screenReaderAlert
  };

  return (
    <DataFetchContext.Provider value={contextValue}>
      {children}
    </DataFetchContext.Provider>
  );
}
