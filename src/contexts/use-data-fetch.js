import { useContext } from "react";
import { DataFetchContext } from "./data-fetch-provider";

export function useDataFetch(
  path,
  {
    addData: addData,
    alertScreenReaderWith:
    alertScreenReaderWith,
    requestConfig: requestConfig
  } = { addData: () => {}, alertScreenReaderWith, requestConfig: {} }
) {
  const { dataFetchInstance, screenReaderAlert } = useContext(DataFetchContext);

  function makeRequest(method, data) {
    // don't overwrite data from requestConfig unless it is present.
    const requestData = data ? {data} : {}
    return dataFetchInstance({method, url: path, ...requestConfig, ...requestData })
      .then((requestData) => {
        if(addData) addData(requestData)
        return requestData
      })
      .then((requestData) => {
        if (alertScreenReaderWith) screenReaderAlert(alertScreenReaderWith)

        return requestData
      }).catch(error => error)
  }

  const get = (data) => makeRequest('get', data)
  const post = (data) => makeRequest('post', data)
  const put = (data) => makeRequest('put', data)
  const patch = (data) => makeRequest('patch', data)
  const destroy = (data) => makeRequest('delete', data)
  const request = (data) => {
    if(!requestConfig.url) {
      throw 'Request must have url set.'
    }
    if(!requestConfig.method) {
      throw 'Request must have a method set.'
    }
    return makeRequest('request', data)
  }

  return {
    get,
    post,
    put,
    patch,
    destroy,
    request
  };
}
