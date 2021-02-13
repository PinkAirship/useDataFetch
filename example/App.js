import React, { useCallback, useState } from 'react'
import MockAdapter from 'axios-mock-adapter'

import { DataFetchProvider, useDataFetch } from '../src'
import { nanoid } from 'nanoid'

export function makeMockAxios(axiosInstance) {
  const mock = new MockAdapter(axiosInstance)

  mock.onGet('/userinfo').reply(200, { user: { id: 'my-id' } })
  // We want a different id each time this endpoint is called, so make it
  // a function
  mock.onGet('/randomId').reply(function () {
    return [200, { id: nanoid() }]
  })
  mock.onGet('/getWithData').reply(function (config) {
    return [200, { message: config.data, config }]
  })
  mock.onPost('/message').reply(function (config) {
    return [200, { message: config.data }]
  })
  mock.onPut('/replace').reply(function (config) {
    return [200, { message: config.data }]
  })
  mock.onPatch('/update').reply(function (config) {
    return [200, { message: config.data }]
  })
  mock.onDelete('/remove').reply(function (config) {
    return [200, { message: config.data }]
  })
}

export default function App() {
  return (
    <DataFetchProvider
      screenReaderAlert={(message) => console.log(message)}
      makeMockDataFetchInstance={makeMockAxios}
    >
      <div>
        <MakeGet />
        <MakeGetWithParams />
        <MakeRandomGet />
        <MakeGetWithData />
        <MakeMethodDefinedCachedGet />
        <MakeCallDefinedCachedGet />
        <MakePost />
        <MakePut />
        <MakePatch />
        <MakeDelete />
        <MakeCustom />
        <MakeGetWithSrAlert />
        <MakeStoredGetFetch />
        <MakeCustomOverwriteData />
      </div>
    </DataFetchProvider>
  )
}

export function MakeGet({
  show = ({ data }) => alert(`User Id: ${data.user.id}`),
}) {
  const { get } = useDataFetch('/userinfo')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(show)}
        value="Make Get"
      />
    </div>
  )
}

export function MakeGetWithParams({
  show = ({ data }) => alert(`User Id: ${data.config.params.id}`),
}) {
  const { get } = useDataFetch('/getWithData')

  return (
    <div>
      <input
        type="button"
        onClick={() =>
          get(undefined, undefined, { params: { id: '1234' } }).then(
            show
          )
        }
        value="Make Get with Params"
      />
    </div>
  )
}

export function MakeRandomGet({
  show = ({ data: { id: id } }) => alert(`User Id: ${id}`),
  buttonText = 'Make Random Get',
}) {
  const { get } = useDataFetch('/randomId')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(show)}
        value={buttonText}
      />
    </div>
  )
}

export function MakeMethodDefinedCachedGet({
  show = ({ data: { id: id } }) => alert(`User Id: ${id}`),
}) {
  const { get } = useDataFetch('/randomId', { useCache: true })

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(show)}
        value="Make Cached Get - Method Definition"
      />
    </div>
  )
}

export function MakeCallDefinedCachedGet({
  show = ({ data: { id: id } }) => alert(`User Id: ${id}`),
}) {
  const { get } = useDataFetch('/randomId', false)

  return (
    <div>
      <input
        type="button"
        onClick={() => get(undefined, true).then(show)}
        value="Make Cached Get - Called"
      />
    </div>
  )
}

export function MakeGetWithData({
  show = ({ data }) => alert(`Message: ${data.message}`),
}) {
  const { get } = useDataFetch('/getWithData')

  return (
    <div>
      <input
        type="button"
        onClick={() => get('my message of get').then(show)}
        value="Make Get with Data"
      />
    </div>
  )
}

let getFunction
// Storing the data works with all other data fetch methods
export function MakeStoredGetFetch() {
  const [ids, setIds] = useState([])
  const [, triggerRerender] = useState()
  const addData = useCallback(
    ({ data: id }) => setIds([...ids, id]),
    [ids]
  )
  const { get } = useDataFetch('/randomId', {
    addData,
  })

  if (getFunction == get) {
    console.log('same get')
  } else {
    getFunction = get
    console.log('different get')
  }

  return (
    <div>
      <input
        type="button"
        onClick={() => get()}
        value="Make Stored Get"
      />
      <input
        type="button"
        onClick={triggerRerender}
        value="Stable Callback - Check Console for output"
      />
      {ids.map((id) => (
        <div key={id.id}>Created id: {id.id}</div>
      ))}
    </div>
  )
}

// Alerting the screen reader works with all other data fetch methods
export function MakeGetWithSrAlert({
  show = ({ data }) =>
    alert(
      `User Id: ${data.user.id} - - Check developer console for sr alert`
    ),
}) {
  const { get } = useDataFetch('/userinfo', {
    alertScreenReaderWith: 'Messages Came',
  })

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(show)}
        value="Make Get And Alert Screen Reader"
      />
    </div>
  )
}

export function MakePost({
  show = ({ data }) => alert(`Returned: ${data.message}`),
}) {
  const { post } = useDataFetch('/message')

  return (
    <div>
      <input
        type="button"
        onClick={() => post('my data').then(show)}
        value="Make Post"
      />
    </div>
  )
}

export function MakePut({
  show = ({ data }) => alert(`Replaced with: ${data.message}`),
}) {
  const { put } = useDataFetch('/replace')

  return (
    <div>
      <input
        type="button"
        onClick={() => put('different data').then(show)}
        value="Make Put"
      />
    </div>
  )
}

export function MakePatch({
  show = ({ data }) => alert(`Updated with: ${data.message}`),
}) {
  const { patch } = useDataFetch('/update')

  return (
    <div>
      <input
        type="button"
        onClick={() => patch('more different data').then(show)}
        value="Make Patch"
      />
    </div>
  )
}

export function MakeDelete({
  show = ({ data }) =>
    alert(`Removed object with id: ${data.message}`),
}) {
  const { destroy } = useDataFetch('/remove')

  return (
    <div>
      <input
        type="button"
        onClick={() => destroy('id').then(show)}
        value="Make Delete"
      />
    </div>
  )
}

export function MakeCustom({
  show = ({ data }) => alert(`Custom data posted: ${data.message}`),
}) {
  const { request } = useDataFetch(undefined, {
    requestConfig: {
      url: '/message',
      method: 'post',
      data: 'my-custom-message',
    },
  })

  return (
    <div>
      <input
        type="button"
        onClick={() => request().then(show)}
        value="Make Custom Call"
      />
    </div>
  )
}

export function MakeCustomOverwriteData({
  show = ({ data }) => alert(`Custom data posted: ${data.message}`),
}) {
  const { request } = useDataFetch(undefined, {
    requestConfig: {
      url: '/message',
      method: 'post',
      data: 'my-custom-message',
    },
  })

  return (
    <div>
      <input
        type="button"
        onClick={() => request('overwritten data').then(show)}
        value="Make Custom Call"
      />
    </div>
  )
}

export function AppSecond() {
  return (
    <DataFetchProvider
      screenReaderAlert={(message) => console.log(message)}
      makeMockDataFetchInstance={makeMockAxios}
      useCache={true}
    >
      <div>
        <MakeRandomGet buttonText="Make Random Get - Context Override Cache" />
        <MakeMethodDefinedCachedGetFalse />
        <MakeCallDefinedCachedGetFalse />
      </div>
    </DataFetchProvider>
  )
}

export function MakeMethodDefinedCachedGetFalse({
  show = ({ data: { id: id } }) => alert(`User Id: ${id}`),
}) {
  const { get } = useDataFetch('/randomId', { useCache: false })

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(show)}
        value="Make Cached Get - Method Definition - Override Cache Behavior"
      />
    </div>
  )
}

export function MakeCallDefinedCachedGetFalse({
  show = ({ data: { id: id } }) => alert(`User Id: ${id}`),
}) {
  const { get } = useDataFetch('/randomId', true)

  return (
    <div>
      <input
        type="button"
        onClick={() => get(undefined, false).then(show)}
        value="Make Cached Get - Called - Override Cache Behavior"
      />
    </div>
  )
}
