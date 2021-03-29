import { useState, useCallback } from 'react'
import { useFetchOnMount } from './use-fetch-on-mount'

const passThrough = (data) => data

function validateNewData(data) {
  const id = data.id
  if (!id) {
    throw new Error(
      'Cannot use default replaceValue with the return object not containing a value for id.'
    )
  }
  return id
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
  } = {
    onSuccess: passThrough,
    onFailure: passThrough,
    hookOptions: {},
    transform: passThrough,
    replaceValue: null,
    removeValue: null,
    updatesUsePath: true,
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
        const newData = transform(newData)
        validateNewData(newData)
        const objectKey = newData.id
        const oldValueIndex = values.findIndex(
          (v) => v.id == objectKey
        )
        const newValues = [...values]
        newValues[oldValueIndex] = transform(data)
        setValues(newValues)
      }
  const updatePath = updatesUsePath
    ? (data) => `${path}/${data.id}`
    : () => path

  const managedDataFetch = {
    get: dataFetch.get,
    post: (postData, opts) => {
      const postUpdateStateHook = ({ data }) => {
        console.log('posted')
        const newValues = transform(data)
        console.log('OldValues:', values, 'NewValues:', newValues)
        setValues([...values, ...newValues])
      }
      return dataFetch.post(postData, {
        ...opts,
        updateStateHook: postUpdateStateHook,
      })
    },
    put: (putData, opts) => {
      console.log(putData)
      console.log(updatePath(putData))
      return dataFetch.put(putData, {
        ...opts,
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(putData),
        },
      })
    },
    patch: (patchData, opts) => {
      return dataFetch.patch(patchData, {
        ...opts,
        updateStateHook: updateValue,
        requestConfig: {
          url: updatePath(patchData),
        },
      })
    },
    destroy: (destroyData, removalKey, opts) => {
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
