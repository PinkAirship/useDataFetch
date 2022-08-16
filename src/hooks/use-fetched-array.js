import { useState, useCallback } from 'react'
import { useFetchOnMount } from './use-fetch-on-mount'

const passThrough = (data) => data
const getArray = (data) => {
  if (Array.isArray(data)) {
    return data
  }
  if (Object.keys(data).length == 1) {
    const arr = data[Object.keys(data)[0]]
    if (Array.isArray(arr)) {
      return data[Object.keys(data)[0]]
    }
  }
  throw new Error(
    'Your data does not have a recognized pattern. Please provide your own transform function.'
  )
}
function getKey(data) {
  if (!data.id) {
    throw new Error(
      'Cannot use default extractObjectKey for objects that do not have an id field.'
    )
  }
  return data.id
}

export function useFetchedArray(
  path,
  {
    onSuccess: onSuccess,
    onFailure: onFailure,
    hookOptions: hookOptions,
    transform: transform,
    extractList: extractList,
    replaceValue: replaceValue,
    removeValue: removeValue,
    updatesUsePath: updatesUsePath,
    extractObjectKey: extractObjectKey,
    cancelRequestOnUnmount: cancelRequestOnUnmount,
  } = {
    onSuccess: passThrough,
    onFailure: passThrough,
    hookOptions: {},
    transform: passThrough,
    extractList: getArray,
    replaceValue: null,
    removeValue: null,
    updatesUsePath: null,
    extractObjectKey: getKey,
    cancelRequestOnUnmount: false,
  }
) {
  // TODO: the defaults for the above are not set when built, figure it out
  // and these can be removed
  extractList = extractList ? extractList : getArray
  onSuccess = onSuccess ? onSuccess : passThrough
  onFailure = onFailure ? onFailure : passThrough
  transform = transform ? transform : passThrough
  extractObjectKey = extractObjectKey ? extractObjectKey : getKey
  //////

  const [values, setValues] = useState([])
  const [requestState, setRequestState] = useState('pending')
  const updateStateHook = useCallback(
    ({ data }) => {
      const newValues = extractList(data)
      setValues(newValues)
    },
    [extractList]
  )
  const dataFetch = useFetchOnMount(path, {
    onSuccess: onSuccess,
    onFailure: onFailure,
    hookOptions: {
      ...hookOptions,
      requestStateListener: setRequestState,
      updateStateHook,
    },
    cancelRequestOnUnmount: cancelRequestOnUnmount,
  })

  const updateValue = replaceValue
    ? replaceValue
    : ({ data }) => {
        const newData = transform(data)
        const objectKey = extractObjectKey(newData)
        const oldValueIndex = values.findIndex(
          (v) => v.id == objectKey
        )
        setValues((state) => {
          const newValues = [...state]
          newValues[oldValueIndex] = newData
          return newValues
        })
      }
  const updatePath = updatesUsePath
    ? updatesUsePath(path)
    : (data) => `${path}/${data.id}`

  const managedDataFetch = {
    get: dataFetch.get,
    post: (postData, opts = {}) => {
      const postUpdateStateHook = ({ data }) => {
        let newValues = transform(data)
        newValues = Array.isArray(newValues) ? newValues : [newValues]
        setValues((state) => [...state, ...newValues])
      }
      return dataFetch.post(postData, {
        updateStateHook: postUpdateStateHook,
        ...opts,
      })
    },
    put: (putData, opts = {}) => {
      return dataFetch.put(putData, {
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(putData),
        },
        ...opts,
      })
    },
    patch: (patchData, opts = {}) => {
      return dataFetch.patch(patchData, {
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(patchData),
        },
        ...opts,
      })
    },
    destroy: (destroyData, removalKey, opts = {}) => {
      const destroyUpdateStateHook = removeValue
        ? removeValue
        : () => {
            setValues((state) => {
              const valueIndex = state.findIndex(
                (j) => j.id === removalKey
              )
              const newValues = [...state]
              newValues.splice(valueIndex, 1)
              return newValues
            })
          }
      return dataFetch.destroy(destroyData, {
        updateStateHook: destroyUpdateStateHook,
        requestConfig: {
          url: updatePath(destroyData),
        },
        ...opts,
      })
    },
  }

  return [values, setValues, requestState, managedDataFetch]
}
