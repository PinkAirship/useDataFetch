# useDataFetch

A data fetch hook that stays out of your way.

Several react hooks exist that allow you to fetch data from a server, but most of them do too much for you. This library takes the best part of the fetch hooks (consistent access, global config, easy use, etc.) and makes it as simple as possible.

This library is also accessibility friendly, allowing for a hooks to alert screenreaders when data is fetched. For more information on screenreaders, see [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions).

## Install

With npm

```bash
npm install @pinkairship/useDataFetch
```

With yarn

```bash
yarn add @pinkairship/useDataFetch
```

## Usage

Wrap the tree you wish to add and remove messages with a DataFetchProvider:

```jsx
function App() {
  return <DataFetchProvider>// children here</DataFetchProvider>
}
```

Then create a component that will hook into using the data fetch instance:

```jsx
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
```

Then put them altogether (full example below):

```jsx
import React, { useState } from 'react'

import { DataFetchProvider, useDataFetch } from '../src'

function App () {
  return (
    <DataFetchProvider>
      <MakeGet />
    </DataFetchProvider>
  )
}

function MakeGet () {
  const { get } = useDataFetch('http://localhost/userinfo')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id}`)}) }
        value="Make Get"
      />
    </div>
  )
}
```

See `example/App.js` for more examples of how to use the other type of http requests (POST, PUT, DELETE, PATCH, and a custom config).

### Caching data

Caching data is useful if you have several components in your application that use the same data but it is inconvenient to pass that data using props. Setting a cache behavior allows you to setup a datafetch for an endpoint and then retrieve that same data only once for multiple components.

This behavior is used in other libraries like `react-relay` and `apollo` where graphql calls are stored, except that the caching algorithm of this cache is just a simple last-recently-used cache and does not attempt to make any assumptions about your data and how to cache it.

#### Caching Definition and Precedence Order

Caching can be set in three separate places (described in precedence order):

1. At the `get|post|put|patch|...` level
1. At the `useDataFetch` level
1. At the `DataFetchProvider` level

In other words, the caching level set at `DataFetchProvider` is overridden by the caching level set at `useDataFetch`, which in turn is overridden by the caching level set at the actual request call.

#### How to Use Cached Calls

To use cached calls, you can set the value at any of the level described and the cache will return the stored value for any call made to a url with the same path.

```jsx
import React, { useState } from 'react'

import { DataFetchProvider, useDataFetch } from '../src'

function App () {
  return (
    <DataFetchProvider useCache={true}>
      <MakeGet />
      <MakeOtherGet />
      <MakeUncachedGet />
    </DataFetchProvider>
  )
}

// Makes a request to the server each time the button is pressed and will return
// a new randomId
function MakeUncachedGet () {
  const { get } = useDataFetch('http://localhost/randomId', { useCache: false })

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id}`)}) }
        value="Make Get"
      />
    </div>
  )
}

// A call made in either of these components will return the same user id even though
// the randomId is called in both
function MakeGet () {
  const { get } = useDataFetch('http://localhost/randomId')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id}`)}) }
        value="Make Get"
      />
    </div>
  )
}
function MakeOtherGet () {
  const { get } = useDataFetch('http://localhost/randomId')

  return (
    <div>
      <input
        type="button"
        onClick={() => get().then(({data}) => alert(`User Id: ${data.user.id}`)}) }
        value="Make Other Get"
      />
    </div>
  )
}
```

### Storing fetched data in state

To store fetched data you will need to pass a configuration object to `useDataFetch` that updates the state.

```jsx
function MakeStoredGetFetch() {
  // set state on the component using useDataFetch
  const [ids, setIds] = useState([])
  const { get } = useDataFetch(
    '/randomId',
    // make sure to wrap the set state function in something that
    // will be called after the data is retrieved
    { addData: ({ data: id }) => setIds([...ids, id]) }
  )

  return (
    <div>
      <input
        type="button"
        onClick={() => get()}
        value="Make Stored Get"
      />
      {ids.map((id) => (
        <div key={id.id}>Created id: {id.id}</div>
      ))}
    </div>
  )
}
```

### Screen Reader Alerts

To add screen reader alerts (which you should - [read more here](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)) pass in a function that accepts the message for the alert.

```jsx
function MakeGetWithSrAlert() {
  const { get } = useDataFetch('/userinfo', {
    alertScreenReaderWith: 'Messages Came',
  })

  return (
    <div>
      <input
        type="button"
        onClick={() => get()}
        value="Make Get And Alert Screen Reader"
      />
    </div>
  )
}
```

## API

The api for useDataFetch is pretty small intentionally - it isn't supposed to handle all use cases. If you want something that does more state management or handles automatic retries and caching behavior, this library may not be for you.

### DataFetchProvider

To use the DataFetchProvider, do the following:

```jsx
import { DataFetchProvider } from '@pinkairship/useDataFetch'

// Wrap the components that your mount point is going to use
function App() {
  return <DataFetchProvider>// children here</DataFetchProvider>
}
```

`datafetchInstance` - The instance of the http fetch object to be used. This must conform to the axios request api ([https://github.com/axios/axios#axios-api](https://github.com/axios/axios#axios-api)). If not provided will use an axios instance.

`axiosCreateOpts` - An object that conforms to the axios configuration api (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config)) to be used when creating the dataFetchInstance.

`screenReaderAlert` - The function your app uses to alert screenreaders. For more information, visit [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions). The function will be passed the value of `alertScreenReaderWith`.

`makeMockDataFetchInstance` - A function that is used to wrap the dataFetchInstance calls for testing purposes. For example, the example app uses [https://github.com/ctimmerm/axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter).

`useCache` - Use a cache for all calls made with this provider. Defaults to false. Can be overridden when defining the request methods, and also when making a request.

`cacheSize` - Set the number of items to keep track of before ejecting values from the cache. Defaults to 50. Cache is a last-recently-used cache.

### useDataFetch

To use the useDataFetch hook, do the following:

```jsx
import { useDataFetch } from '@pinkairship/useDataFetch'

function MakeGet() {
  // destructure the get function to request info from /userinfo
  const { get } = useDataFetch('/userinfo')

  return (
    <div>
      <input
        type="button"
        // call the get function on click
        onClick={() => get()}
        value="Make Get"
      />
    </div>
  )
}
```

Note that get does not make a request automatically when useDataFetch is called. This is intentional and breaks from the pattern of many other hooks that wrap data fetching. You will need to call your get in a `useEffect` if you desire to have it fire on component load.

```jsx
import { useEffect } from 'react'
import { useDataFetch } from '@pinkairship/useDataFetch'

function MakeGet() {
  // destructure the get function to request info from /userinfo
  const { get } = useDataFetch('/userinfo')
  useEffect(() => {
    get()
  })

  return (
    <div>
      <input
        type="button"
        // call the get function on click
        onClick={() => get()}
        value="Make Get"
      />
    </div>
  )
}
```

`path` - The path to your resource. This can be a fully qualified url, or just the path instance if you configured your DataFetchProvider to use a baseUrl (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information on the axios api).

`config` - An object that accpets specific values.

- `addData` - A function that updates the state you wish to house your fetched data
- `alertsScreenReaderWith` - A message for the screenReaderAlert to read (see [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) for more information).
- `requestConfig` - An axios request configuration object (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information on the axios api).
- `useCache` - Use the cache for all calls returned. Overrides the cache settings for the provider. Can be overridden by at the level that the call is made.

#### useDataFetch methods

useDataFetch will return an object with functions ready to make your api requests. Note that `bool` represents a boolean value and is used to toggle the caching behavior.

`get` - make a get request `get(undefined, bool)`. Unlike axios, this does accept a data body `get(data, bool)`. Note that `undefined` must be passed in to use the cache without passing data.

`post` - make a post request `post(data, bool)`.

`put` - make a put request `put(data, bool)`.

`patch` - make a patch request `patch(data, bool)`.

`destroy` - make a delete request `destroy(data, bool)`.

`request` - make a custom request `request(data, bool)`. Note that this requires that you create a request config in your useDataFetch hook setup: `useDataFetch(undefined, { requestConfig: <dataobject>})`. undefined (or some value) must be passed in first or else the requestConfig will not be registered and it will throw an error. For more infomration the axios request config, see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config). You must include a url and a method in the requestConfig or an error will be thrown.

All of these methods return an axios request promise if you do not replace the http library with something else. This allows you control to chain after a request.

## Development

To run a development environment:

```
npm run start
```

You can then navigate to `http://localhost:8080` and see the example app running. Using webpack serve, any changes you make to the `src/` files will automatically be reflected.

### Testing

Tests should be included in the `__test__` file. To help in writing tests, a wrapper
function has been provided in `__tests__/test-utils.js`. See `__tests__/uncached-calls.js` for examples on how to write tests.

#### Running Tests

To run tests:

```
npm run test
```

## Troubleshooting

1. If you install into another project locally (using `npm install <folder>`) be sure to follow the advice found here [https://stackoverflow.com/questions/56021112/react-hooks-in-react-library-giving-invalid-hook-call-error](https://stackoverflow.com/questions/56021112/react-hooks-in-react-library-giving-invalid-hook-call-error)
