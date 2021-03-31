import { useContext } from 'react'
import { DataFetchContext } from '../contexts/data-fetch-provider'

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
    alertScreenReaderWith: undefined,
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

  function makeRequest(
    method,
    data,
    {
      methodUseCache,
      methodRequestConfig: methodRequestConfig,
      methodUpdateStateHook: methodUpdateStateHook,
      requestStateListener: methodRequestStateListener,
    } = {
      methodRequestConfig: {},
      methodUpdateStateHook: undefined,
    }
  ) {
    const updateStateHook =
      typeof hookUpdateStateHook != 'undefined'
        ? hookUpdateStateHook
        : providerUpdateStateHook
    const hookToUpdateState =
      typeof methodUpdateStateHook != 'undefined'
        ? methodUpdateStateHook
        : updateStateHook
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
        if (hookToUpdateState)
          hookToUpdateState(responseData, finalRequestConfg)
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

  const get = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) =>
    makeRequest('get', data, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: requestConfig,
      requestStateListener,
    })
  const query = (
    params,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) =>
    makeRequest('get', undefined, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: { ...requestConfig, params },
      requestStateListener,
    })
  const post = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) => {
    return makeRequest('post', data, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: requestConfig,
      requestStateListener,
    })
  }

  const put = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) =>
    makeRequest('put', data, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: requestConfig,
      requestStateListener,
    })
  const patch = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) =>
    makeRequest('patch', data, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: requestConfig,
      requestStateListener,
    })
  const destroy = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
  ) =>
    makeRequest('delete', data, {
      methodUseCache: useCache,
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: requestConfig,
      requestStateListener,
    })
  const request = (
    data,
    {
      useCache,
      requestConfig,
      requestStateListener,
      updateStateHook,
    } = {}
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
      methodUpdateStateHook: updateStateHook,
      methodRequestConfig: mergedConfig,
      requestStateListener,
    })
  }

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
