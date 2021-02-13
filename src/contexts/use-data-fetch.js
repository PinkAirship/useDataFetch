import { useContext, useMemo } from 'react'
import { DataFetchContext } from './data-fetch-provider'

// stable function signature for equality checks when addData is not defined
function noop() {}

export function useDataFetch(
  path,
  {
    addData: addData,
    alertScreenReaderWith: alertScreenReaderWith,
    requestConfig: hookRequestConfig,
    useCache: hookUseCache,
  } = {
    addData: noop,
    alertScreenReaderWith,
    hookRequestConfig: {},
    hookUseCache: undefined,
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
    { methodUseCache, methodRequestConfig: methodRequestConfig } = {
      methodRequestConfig: {},
    }
  ) {
    // Order of precedence: method use - method defined - context defined
    let computedUseCache =
      typeof hookUseCache != 'undefined'
        ? hookUseCache
        : contextUseCache
    computedUseCache =
      typeof methodUseCache != 'undefined'
        ? methodUseCache
        : computedUseCache
    console.log(
      computedUseCache,
      contextUseCache,
      hookUseCache,
      methodUseCache
    )

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
      ...hookRequestConfig,
      ...requestData,
      ...methodRequestConfig,
    })
      .then((responseData) => {
        if (computedUseCache) cache.set(path, responseData)
        return responseData
      })
      .then((responseData) => {
        if (addData) addData(responseData)
        return responseData
      })
      .then((responseData) => {
        if (alertScreenReaderWith)
          screenReaderAlert(alertScreenReaderWith)
        return responseData
      })
      .catch((error) => error)
  }

  const get = useMemo(
    () => (data, { useCache, requestConfig } = {}) =>
      makeRequest('get', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
  )
  const post = useMemo(
    () => (data, { useCache, requestConfig } = {}) =>
      makeRequest('post', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
  )
  const put = useMemo(
    () => (data, { useCache, requestConfig } = {}) =>
      makeRequest('put', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
  )
  const patch = useMemo(
    () => (data, { useCache, requestConfig } = {}) =>
      makeRequest('patch', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
  )
  const destroy = useMemo(
    () => (data, { useCache, requestConfig } = {}) =>
      makeRequest('delete', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
  )
  const request = useMemo(
    () => (data, { useCache, requestConfig } = {}) => {
      const mergedConfig = { ...hookRequestConfig, ...requestConfig }
      if (!hookRequestConfig.url) {
        throw 'Request must have url set.'
      }
      if (!hookRequestConfig.method) {
        throw 'Request must have a method set.'
      }
      return makeRequest('request', data, {
        methodUseCache: useCache,
        methodRequestConfig: mergedConfig,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addData]
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
