import { useContext, useMemo } from 'react'
import { DataFetchContext } from './data-fetch-provider'

// stable function signature for equality checks
function noop() {}

export function useDataFetch(
  path,
  {
    updateStateHook: hookUpdateStateHook,
    alertScreenReaderWith: alertScreenReaderWith,
    requestConfig: hookRequestConfig,
    useCache: hookUseCache,
    requestStateListener: hookRequestStateListener,
  } = {
    alertScreenReaderWith,
    hookRequestConfig: {},
    hookUseCache: undefined,
    hookRequestStateListener: noop,
  }
) {
  const {
    dataFetchInstance,
    screenReaderAlert,
    cache,
    useCache: contextUseCache,
    updateStateHook: providerUpdateStateHook,
  } = useContext(DataFetchContext)
  const updateStateHook =
    typeof hookUpdateStateHook != 'undefined'
      ? hookUpdateStateHook
      : providerUpdateStateHook

  function makeRequest(
    method,
    data,
    {
      methodUseCache,
      methodRequestConfig: methodRequestConfig,
      requestStateListener: methodRequestStateListener,
    } = {
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
    const requestStateListener =
      typeof methodRequestStateListener != 'undefined'
        ? methodRequestStateListener
        : hookRequestStateListener || noop

    if (computedUseCache) {
      const cachedValue = cache.get(path)
      if (cachedValue) {
        requestStateListener('success')
        return Promise.resolve(cachedValue)
      }
    }
    // don't overwrite data from requestConfig unless it is present.
    const requestData = data ? { data } : {}
    const finalRequestConfg = {
      method,
      url: path,
      ...hookRequestConfig,
      ...methodRequestConfig,
      ...requestData,
    }
    requestStateListener('running')
    return dataFetchInstance(finalRequestConfg)
      .then((responseData) => {
        requestStateListener('success')
        if (computedUseCache) cache.set(path, responseData)
        return responseData
      })
      .then((responseData) => {
        if (updateStateHook)
          updateStateHook(responseData, finalRequestConfg)
        return responseData
      })
      .then((responseData) => {
        if (alertScreenReaderWith)
          screenReaderAlert(alertScreenReaderWith)
        return responseData
      })
      .catch((error) => {
        requestStateListener('error')
        return error
      })
  }

  const get = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('get', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const query = useMemo(
    () => (
      params,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('get', undefined, {
        methodUseCache: useCache,
        methodRequestConfig: { ...requestConfig, params },
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const post = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('post', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const put = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('put', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const patch = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('patch', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const destroy = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) =>
      makeRequest('delete', data, {
        methodUseCache: useCache,
        methodRequestConfig: requestConfig,
        requestStateListener,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )
  const request = useMemo(
    () => (
      data,
      { useCache, requestConfig, requestStateListener } = {}
    ) => {
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
        requestStateListener,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStateHook]
  )

  return {
    get,
    post,
    put,
    patch,
    destroy,
    request,
    query,
  }
}
