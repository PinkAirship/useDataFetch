import { useContext } from 'react'
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

  function makeRequest(method, data, methodUseCache) {
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

  const get = (data, useCache) => makeRequest('get', data, useCache)
  const post = (data, useCache) => makeRequest('post', data, useCache)
  const put = (data, useCache) => makeRequest('put', data, useCache)
  const patch = (data, useCache) =>
    makeRequest('patch', data, useCache)
  const destroy = (data, useCache) =>
    makeRequest('delete', data, useCache)
  const request = (data, useCache) => {
    if (!requestConfig.url) {
      throw 'Request must have url set.'
    }
    if (!requestConfig.method) {
      throw 'Request must have a method set.'
    }
    return makeRequest('request', data, useCache)
  }

  return {
    get,
    post,
    put,
    patch,
    destroy,
    request,
  }
}
