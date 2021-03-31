import { useState, useCallback } from 'react'
import { useFetchOnMount } from './use-fetch-on-mount'

const passThrough = (data) => data

export function useFetched(
  path,
  {
    onSuccess: onSuccess,
    onFailure: onFailure,
    hookOptions: hookOptions,
    createUsesPath: createUsesPath,
  } = {
    onSuccess: passThrough,
    onFailure: passThrough,
    hookOptions: {},
    createUsesPath: null,
  }
) {
  onSuccess = onSuccess ? onSuccess : passThrough
  onFailure = onFailure ? onFailure : passThrough

  const [value, setValue] = useState({})
  const [requestState, setRequestState] = useState('pending')
  const updateStateHook = useCallback(({ data }) => {
    setValue(data)
  }, [])
  const dataFetch = useFetchOnMount(path, {
    onSuccess: onSuccess,
    onFailure: onFailure,
    hookOptions: {
      ...hookOptions,
      requestStateListener: setRequestState,
      updateStateHook,
    },
  })

  const createPath = createUsesPath
    ? createUsesPath(path)
    : () => {
        const parts = path.split('/')
        return parts.slice(0, parts.length - 1).join('/')
      }

  const managedDataFetch = {
    get: dataFetch.get,
    post: (postData, opts = {}) => {
      return dataFetch.post(postData, {
        ...opts,
        requestConfig: {
          url: createPath(),
        },
      })
    },
    put: dataFetch.put,
    patch: dataFetch.patch,
    destroy: dataFetch.destroy,
  }

  return [value, setValue, requestState, managedDataFetch]
}
