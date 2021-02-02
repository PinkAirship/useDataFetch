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
    return dataFetchInstance({method, url: path, data, ...requestConfig})
      .then((requestData) => {
        if(addData) addData(requestData)
        return requestData
      })
      .then((requestData) => {
        if (alertScreenReaderWith) screenReaderAlert(alertScreenReaderWith)

        return requestData
      }).catch(error => error)
  }

  const get = () => makeRequest('get')
  const post = (data) => makeRequest('post', data)
  const put = (data) => makeRequest('put', data)
  const patch = (data) => makeRequest('patch', data)
  const destroy = (data) => makeRequest('delete', data)
  const request = () => {
    if(!requestConfig.url) {
      throw 'Request must have url set.'
    }
    if(!requestConfig.method) {
      throw 'Request must have a method set.'
    }
    return makeRequest('request')
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
