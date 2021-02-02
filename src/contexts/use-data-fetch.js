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

  // requestMethodSetup allows for the request object to set addData as it may not
  // be set, and to alert the developer that the requestConfig is empty and
  // must be set
  const requestMethodSetup = () => {
    if(!requestConfig.url) {
      throw 'Request must have url set.'
    }
    if(!requestConfig.method) {
      throw 'Request must have a method set.'
    }
    console.log('here')
    if(!addData) {
      addData = () => {}
    }
  }


  function makeRequest(method, data, setupRequest = () => {}) {
    setupRequest()
    return dataFetchInstance({method, url: path, data, ...requestConfig})
      .then((requestData) => {
        addData(requestData)
        return requestData
      })
      .then((requestData) => {
        screenReaderAlert(alertScreenReaderWith)

        return requestData
      }).catch(error => error)
  }

  const get = () => makeRequest('get')
  const post = (data) => makeRequest('post', data)
  const put = (data) => makeRequest('put', data)
  const patch = (data) => makeRequest('patch', data)
  const destroy = (data) => makeRequest('destroy', data)
  const request = () => makeRequest('request', undefined, requestMethodSetup)

  return {
    get,
    post,
    put,
    patch,
    destroy,
    request
  };
}
