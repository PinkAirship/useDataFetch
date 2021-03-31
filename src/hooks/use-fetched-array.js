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
  })

  const updateValue = replaceValue
    ? replaceValue
    : ({ data }) => {
        const newData = transform(data)
        const objectKey = extractObjectKey(newData)
        const oldValueIndex = values.findIndex(
          (v) => v.id == objectKey
        )
        const newValues = [...values]
        newValues[oldValueIndex] = newData
        setValues(newValues)
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
        setValues([...values, ...newValues])
      }
      return dataFetch.post(postData, {
        ...opts,
        updateStateHook: postUpdateStateHook,
      })
    },
    put: (putData, opts = {}) => {
      return dataFetch.put(putData, {
        ...opts,
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(putData),
        },
      })
    },
    patch: (patchData, opts = {}) => {
      return dataFetch.patch(patchData, {
        ...opts,
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(patchData),
        },
      })
    },
    destroy: (destroyData, removalKey, opts = {}) => {
      const destroyUpdateStateHook = removeValue
        ? removeValue
        : () => {
            const valueIndex = values.findIndex(
              (j) => j.id === removalKey
            )
            const newValues = [...values]
            newValues.splice(valueIndex, 1)
            setValues(newValues)
          }
      return dataFetch.destroy(destroyData, {
        ...opts,
        updateStateHook: destroyUpdateStateHook,
        requestConfig: {
          url: updatePath(destroyData),
        },
      })
    },
  }

  return [values, setValues, requestState, managedDataFetch]
}
