import { useEffect, useState } from 'react'
import { useDataFetch } from './use-data-fetch'

export function useFetchOnMount(
  path,
  {
    onSuccess: onSuccess,
    onFailure: onFailure,
    hookOptions: hookOptions,
  } = {
    onSuccess: (request) => request,
    onFailure: (request) => request,
    hookOptions: {},
  }
) {
  const [renders, setRenders] = useState(0)
  const dataFetch = useDataFetch(path, { ...hookOptions })

  useEffect(() => {
    dataFetch.get().then(onSuccess).catch(onFailure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renders])
  // Must reset the useEffect so that a refetch will update the state of the updateStateHook
  // when the get is applied again (possibly in a refetch)
  const fetches = {}
  Object.keys(dataFetch).forEach((df) => {
    fetches[df] = ({ ...args }) => {
      setRenders(renders + 1)
      return dataFetch[df](args)
    }
  })
  return fetches
}
