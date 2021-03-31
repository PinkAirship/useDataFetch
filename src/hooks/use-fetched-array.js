import { useState, useCallback } from 'react'
import { useFetchOnMount } from './use-fetch-on-mount'

const passThrough = (data) => data

function getKey(data) {
  if (!data.id) {
    throw new 'Cannot use default extractObjectKey for objects that do not have an id field.'()
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
    replaceValue: replaceValue,
    removeValue: removeValue,
    updatesUsePath: updatesUsePath,
    extractObjectKey: extractObjectKey,
  } = {
    onSuccess: passThrough,
    onFailure: passThrough,
    hookOptions: {},
    transform: passThrough,
    replaceValue: null,
    removeValue: null,
    updatesUsePath: null,
    extractObjectKey: getKey,
  }
) {
  const [values, setValues] = useState([])
  const [requestState, setRequestState] = useState('pending')
  const updateStateHook = useCallback(
    ({ data }) => {
      const newValues = transform(data)
      setValues(newValues)
    },
    [transform]
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
        const newValues = transform(data)
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
