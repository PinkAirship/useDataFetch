import { useContext, useMemo } from 'react'
import { DataFetchContext } from './data-fetch-provider'

export function useDataFetch(
  path,
  {
    addData: addData,
    alertScreenReaderWith: alertScreenReaderWith,
    requestConfig: requestConfig,
    useCache: useCache,
  } = {
    addData: () => {},
    alertScreenReaderWith,
    requestConfig: {},
    useCache: undefined,
  }
) {
  const {
    dataFetchInstance,
    screenReaderAlert,
    cache,
    useCache: contextUseCache,
  } = useContext(DataFetchContext)

  function makeRequest(
    method,
    data,
    methodUseCache,
    methodRequestConfig = {}
  ) {
    // Order of precedence: method use - method defined - context defined
    let computedUseCache =
      typeof useCache != 'undefined' ? useCache : contextUseCache
    computedUseCache =
      typeof methodUseCache != 'undefined'
        ? methodUseCache
        : computedUseCache

    if (computedUseCache) {
      const cachedValue = cache.get(path)
      if (cachedValue) {
        return Promise.resolve(cachedValue)
      }
    }
    // don't overwrite data from requestConfig unless it is present.
    const requestData = data ? { data } : {}
    return dataFetchInstance({
      method,
      url: path,
      ...requestConfig,
      ...requestData,
      ...methodRequestConfig,
    })
      .then((requestData) => {
        if (computedUseCache) cache.set(path, requestData)
        return requestData
      })
      .then((requestData) => {
        if (addData) addData(requestData)
        return requestData
      })
      .then((requestData) => {
        if (alertScreenReaderWith)
          screenReaderAlert(alertScreenReaderWith)
        return requestData
      })
      .catch((error) => error)
  }

  const get = useMemo(
    () => (data, useCache, methodRequestConfig) =>
      makeRequest('get', data, useCache, methodRequestConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const post = useMemo(
    () => (data, useCache, methodRequestConfig) =>
      makeRequest('post', data, useCache, methodRequestConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const put = useMemo(
    () => (data, useCache, methodRequestConfig) =>
      makeRequest('put', data, useCache, methodRequestConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const patch = useMemo(
    () => (data, useCache, methodRequestConfig) =>
      makeRequest('patch', data, useCache, methodRequestConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const destroy = useMemo(
    () => (data, useCache, methodRequestConfig) =>
      makeRequest('delete', data, useCache, methodRequestConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const request = useMemo(
    () => (data, useCache, methodRequestConfig) => {
      if (!requestConfig.url) {
        throw 'Request must have url set.'
      }
      if (!requestConfig.method) {
        throw 'Request must have a method set.'
      }
      return makeRequest(
        'request',
        data,
        useCache,
        methodRequestConfig
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {
    get,
    post,
    put,
    patch,
    destroy,
    request,
  }
}
