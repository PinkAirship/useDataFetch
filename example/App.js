import React, { useState } from 'react'
import MockAdapter from 'axios-mock-adapter'

import { DataFetchProvider, useDataFetch } from '../src'
import { nanoid } from 'nanoid'

function makeMockAxios (axiosInstance) {
  const mock = new MockAdapter(axiosInstance)

  mock.onGet('/userinfo').reply(200, { user: { id: 'my-id' } })
  // We want a different id each time this endpoint is called, so make it
  // a function
  mock.onGet('/randomId').reply(function (_) {
    return [200, { id: nanoid() }]
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


export default function App () {
  return (
    <DataFetchProvider
      screenReaderAlert={(message) => console.log(message)}
      makeMockDataFetchInstance={makeMockAxios}
    >
      <div>
        <MakeGet />
        <MakePost />
        <MakePut />
        <MakePatch />
        <MakeDelete />
        <MakeCustom />
        <MakeGetWithSrAlert />
        <MakeStoredGetFetch />
      </div>
    </DataFetchProvider>
  )
}

export function MakeGet () {
  const { get } = useDataFetch('/userinfo')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id}`)) }
        value="Make Get"
      />
    </div>
  )
}

// Storing the data works with all other data fetch methods
export function MakeStoredGetFetch () {
  const [ids, setIds] = useState([])
  const { get } = useDataFetch(
    '/randomId',
    { addData: ({ data: id }) => setIds([...ids, id]) }
  )

  return (
    <div>
      <input type="button" onClick={() => get()} value="Make Stored Get" />
      {ids.map(id => <div key={id.id}>{id.id}</div>)}
    </div>
  )
}

// Alerting the screen reader works with all other data fetch methods
export function MakeGetWithSrAlert () {
  const { get } = useDataFetch('/userinfo', { alertScreenReaderWith: 'Messages Came'})

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id} - - Check developer console for sr alert`)) }
        value="Make Get And Alert Screen Reader"
      />
    </div>
  )
}


export function MakePost () {
  const { post } = useDataFetch('/message')

  return (
    <div>
      <input
        type="button"
        onClick={() => post('my data').then(({data}) => alert(`Returned: ${data.message}`)) }
        value="Make Post"
      />
    </div>
  )
}

export function MakePut () {
  const { put } = useDataFetch('/replace')

  return (
    <div>
      <input
        type="button"
        onClick={() => put('different data').then(({data}) => alert(`Replaced with: ${data.message}`)) }
        value="Make Put"
      />
    </div>
  )
}

export function MakePatch () {
  const { patch } = useDataFetch('/update')

  return (
    <div>
      <input
        type="button"
        onClick={() => patch('more different data').then(({data}) => alert(`Updated with: ${data.message}`)) }
        value="Make Patch"
      />
    </div>
  )
}

export function MakeDelete () {
  const { destroy } = useDataFetch('/remove')

  return (
    <div>
      <input
        type="button"
        onClick={() => destroy('id').then(({data}) => alert(`Removed object with id: ${data.message}`)) }
        value="Make Delete"
      />
    </div>
  )
}

export function MakeCustom () {
  const { request } = useDataFetch(undefined, { requestConfig: {
    url: '/message',
    method: 'post',
    data: 'my-custom-message'
  }})

  return (
    <div>
      <input
        type="button"
        onClick={() => request().then(({data}) => alert(`Custom data posted: ${data.message}`)) }
        value="Make Custom Call"
      />
    </div>
  )
}
