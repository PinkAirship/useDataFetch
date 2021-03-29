# useDataFetch

A data fetch hook that stays out of your way.

Several react hooks exist that allow you to fetch data from a server, but most of them do too much for you. This library takes the best part of the fetch hooks (consistent access, global config, easy use, etc.) and makes it as simple as possible.

This library is also accessibility friendly, allowing for easy setup to alert screenreaders when data is fetched. For more information on screenreaders, see [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions).

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Usage](#usage)
  - [Caching data](#caching-data)
    - [Caching Definition and Precedence Order](#caching-definition-and-precedence-order)
    - [How to Use Cached Calls](#how-to-use-cached-calls)
  - [Storing fetched data in state](#storing-fetched-data-in-state)
  - [Screen Reader Alerts](#screen-reader-alerts)
  - [Listening for Request State Changes](#listening-for-request-state-changes)
- [API](#api)
  - [Definitions](#definitions)
  - [DataFetchProvider](#datafetchprovider)
  - [useDataFetch](#usedatafetch-1)
    - [useDataFetch methods](#usedatafetch-methods)
      - [Request Level Options](#request-level-options)
- [Testing Your Application with useDataFetch](#testing-your-application-with-usedatafetch)
  - [Spying Data Fetching](#spying-data-fetching)
- [Development](#development)
  - [Testing](#testing)
    - [Running Tests](#running-tests)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

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

## useFetchOnMount

`useFetchOnMount` handles the common use case of loading data on mount. Without `useFetchOnMount`, when fetching data on mount of a component is handled as follows:

```jsx
function MakeGet () {
  const updateStatefunc = updateStateFunc(somestate)
  const { get } = useDataFetch('http://localhost/userinfo')

  useEffect(() => get.then(updateStateFunc).catch(onErrorHandler)))

  ...
}
```

With preload:

```jsx
function MakeGet () {
  const updateStatefunc = updateStateFunc(somestate)
  const { get } = useDataFetch('http://localhost/userinfo', {
    hookOptions: {
      updateStateHook: updateStateFunc
    }
  })

  const refetch = () => get()

  ...
}
```

The advantages of this api:

1. Simplified onMount datafetch management
1. Greater control over refetching
1. More delcaritive naming of onMount fetching

All of the options used for the base `useDataFetch` can be passed down in the hookOptions section (and all options defined at the same levels as before are handled the same way).

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
  // to prevent refetching data on each rerender, you must wrap the
  // the state update in a useCallback hook
  const updateStateHook = useCallback(
    // make sure to wrap the set state function in something that
    // will be called after the data is retrieved
    ({ data: id }) => setIds([...ids, id]),
    [ids]
  )
  const { get } = useDataFetch('/randomId', { updateStateHook })

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

### Listening for Request State Changes

Many libraries will provide mechanisms to automatically detect the state that the request is in - retrieving data, was it a success, was it a failure. These state changes are useful to control the ui when fetching data.

You can listen to the request lifecycle of `useDataFetch` by defining the `requestStateListener` function at either the hook level or the request level. These functions will pass a string only that defines the state (one of `running`|`success`(for success)|`error`(for error)).

```jsx
function MakeGet() {
  const [loading, setLoading] = useState('pending')
  const { get } = useDataFetch('/userinfo', {
    requestStateListener: setLoading,
  })

  return (
    <div>
      <input
        type="button"
        onClick={() => get()}
        value="Make Get - Success"
      />
      <div>Request State: {loading}</div>
    </div>
  )
}
```

## API

The api for useDataFetch is pretty small intentionally - it isn't supposed to handle all use cases. If you want something that does more state management or handles automatic retries and caching behavior, this library may not be for you.

### Definitions

There are is a need to define the levels that this document described. Often a setting set at one level can be overridden at a more granular level. The levels are as follows:

1. Provider level - this is the first level and defines the configuration set when making a `DataFetchProvider`
1. Hook Level - this is the second level and defines the configuration set when using the `useDataFetch` hook. Settings here override the Provider level.
1. Request Level - this is the third level and defines the configuration set when making a request, ie `get()`. Settings here override the Provider and the Hook levels.

### DataFetchProvider

To use the DataFetchProvider, do the following:

```jsx
import { DataFetchProvider } from '@pinkairship/useDataFetch'

// Wrap the components that your mount point is going to use
function App() {
  return <DataFetchProvider>// children here</DataFetchProvider>
}
```

Below is table of the props that can be passed into the provider:

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `datafetchInstance` | `object` | <ul><li>The instance of the http fetch object to be used.</li><li>This must conform to the axios request api ([https://github.com/axios/axios#axios-api](https://github.com/axios/axios#axios-api)).</li><li>If not provided will use an axios instance.</li></ul> |
| `axiosCreateOpts` | `object` | <ul><li>An object that conforms to the axios configuration api to be used when creating the dataFetchInstance. <li>See [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information.  |
| `screenReaderAlert` |`function` | <ul><li>The function your app uses to alert screenreaders. <li>The function will be passed the value of `alertScreenReaderWith`.<li>For more information, visit [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions).  |
| `makeMockDataFetchInstance` | `function` | <ul><li>A function that is used to wrap the dataFetchInstance calls for testing purposes. <li>For example, the example app uses [https://github.com/ctimmerm/axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter). |
| `useCache` | `boolean` | <ul><li>Use a cache for all calls made with this provider. <li>Defaults to false. <li>Can be overridden when defining the request methods, and also when making a request. |
| `cacheSize` | `number` | <ul><li>Set the number of items to keep track of before ejecting values from the cache. <li>Defaults to 50. <li>Cache is a last-recently-used cache. |
| `updateStateHook` | `function` | <ul><li>A function that updates the state you wish to house your fetched data. <li>This function will be passed the responseData and the requestConfig - `(responseData, requestConfig) => {}`. <li> This hook is overridden if `useDataFetch` also defines `updateStateHook`.<li>See the `<AppThird>` component in `example/App.js` for example of how it can be used.  |

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

Below is a table of the parameters for `useDataFetch`:

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `path` | `string` | <ul><li>The path to your resource.</li><li>This can be a fully qualified url, or just the path instance if you configured your DataFetchProvider to use a baseUrl (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information on the axios api).</li></ul> |
| `config` | `object` | An object that accepts specific values. |

The config parameter has a shape as follows:

| Configuration Key | Type | Description |
| ----------------- | ---- | ----------- |
| `updateStateHook` | `function` | <ul><li>A function that updates the state you wish to house your fetched data.</li><li>This will override the `DataFetchProvider` if it has defined the `updateStateHook`.</li><ul> |
| `alertsScreenReaderWith` | `any` | <ul><li>A message for the screenReaderAlert to read (see [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) for more information).</li><li>Note that your screenReaderAlert function can accept any type, so this also can be any type.</li></ul> |
| `requestConfig` | `object` | An axios request configuration object (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information on the axios api). |
| `useCache` | `boolean` | <ul><li>Use the cache for all calls returned.</li><li>Overrides the cache settings for the provider. Can be overridden by at the level that the call is made.</li></ul> |
| `requestStateListener` | `function` | <ul><li>Listen for the state changes in the request object</li><li>This is a function that recieves a string dictating the state (one of `running`\|`success`(for success)\|`error`(for error))</li><li>Can be overridden at the request level.</li></ul> |

#### useDataFetch methods

`useDataFetch` will return an object with functions ready to make your api requests.

Available methods that `useDataFetch` will generate are:

| Method | Description | Usage | Notes |
| --- | ---- | -------- | -------- |
| `get`  | make a get request |  <div style="min-width:15rem">`get()`</div> | <ul><li>Unlike axios, this does accept a data body `get(data, opts = {})`.</li><li>Note that `undefined` must be passed in to use the requestConfig without passing in data. To send query params: `get(undefined, { requestConfig: { params: {} } })`. </li>|
| `query` | make a query (GET) request |`query(params, opts = {})` | This is a nicer way of doing `get(undefined, { requestConfig: { params: {} } })`. |
| `post` | make a post request | `post(data, opts = {})` | |
| `put`  | make a put request |`put(data, opts = {})` | |
| `patch` | make a patch request |`patch(data, opts = {})` | |
| `destroy` | make a delete request| `destroy(data, opts = {})` | |
| `request` | make a custom request |`request(data, opts = {})` | <ul><li>Note that this requires that you create a request config in your useDataFetch hook setup: `useDataFetch(undefined, { requestConfig: <dataobject>})`</li><li>`undefined` (or some value) must be passed in first or else the requestConfig will not be registered and it will throw an error.</li><li>For more infomration the axios request config, see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config). You must include a url and a method in the requestConfig or an error will be thrown.</li></ul>|

All of these methods return an axios request promise if you do not replace the http library with something else. This allows you control to chain after a request.

##### Request Level Options

The request level allows you to dynamically change a few of the options by defining behavior on the fly. These options override similar options defined at the hook level or the provider level.

| Option | Description |
| ------ | ----------- |
| `useCache` | Use the cache for all calls returned |
| `requestConfig` | Used to send any last minute configuration, such as dymanically generated query params - `{ params: { id: '1234' } }`. |
| `requestStateListener` | Listen for the state changes in the request object. This is a function that recieves a string dictating the state (one of `running`\|`success`(for success)|`error`(for error)). |

## useFetchOnMount

To use `useFetchOnMount`, do the following:


```jsx
import { useFetchOnMount } from '@pinkairship/useDataFetch'

function MakeGet() {
  // destructure the get function to request info from /userinfo
  const { get } = useFetchOnMount('/userinfo')

  return (
    <div>
      <input
        type="button"
        // call the get function on click
        onClick={() => get()}
        value="Refetch Get"
      />
    </div>
  )
}
```

If you want to track the request data using some state tracking:

```jsx
import { useFetchOnMount } from '@pinkairship/useDataFetch'

function MakeGet() {
  // set state on the component using useDataFetch
  const [ids, setIds] = useState([])
  // to prevent refetching data on each rerender, you must wrap the
  // the state update in a useCallback hook
  const updateStateHook = useCallback(
    // make sure to wrap the set state function in something that
    // will be called after the data is retrieved
    ({ data: id }) => setIds([...ids, id]),
    [ids]
  )
  // destructure the get function to request info from /userinfo
  const { get } = useFetchOnMount('/userinfo', { hookOptions: updateStateHook })

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

`useFetchOnMount` returns the same object as `useDataFetch`, so all the same api applies here except that you will need to pass those options through the `hookOptions` key of the opts config. There are a few additional options that can be used when defining a `useFetchOnMount` request.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `path` | `string` | <ul><li>The path to your resource.</li><li>This can be a fully qualified url, or just the path instance if you configured your DataFetchProvider to use a baseUrl (see [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config) for more information on the axios api).</li></ul> |
| `config` | `object` | An object that accepts specific values. |

The config parameter has a shape as follows:

| Configuration Key | Type | Description |
| ----------------- | ---- | ----------- |
| `onSuccess` | func | A callback to fire when the request is successful. Note that this is called after the `updateStateHook` is called (if defined) |
| `onFailure` | func | A callback to fire when the request is a failure. Fires after `updateStateHook` |
| `hookOptions` | object | The options for the underlying `useDataFetch` function. See the `useDataFetch` config options for more details. |

## Testing Your Application with useDataFetch

For the most part testing your application while using `useDataFetch` should be pretty straightforward - wrap whatever component you are using `useDataFetch` with a `DataFetchProvider` instance.

```jsx
function makeMockAxios = () => {... creates a mock axios instance ...}

function renderComponent(children) {
  return render( // some render function for your testing library
    <DataFetchProvider makeMockDataFetchInstance={makeMockAxios}>
      {children}
    </DataFetchProvider>
  )
}

test('my test', () => {
  const component = renderComponent(<MyComponent />)
  ... your test
})
```

You can check out examples of testing in the `__tests__` folder for more information.

### Spying Data Fetching

Sometimes you want to verify that a component makes a call with the correct data to your provider. This can be difficult with [https://github.com/ctimmerm/axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter) (the recommended mock library for axios).

In order to spy on a request, one approach is to create a mock that accepts a spy as the `dataFetchInstance` of the `DataFetchProvider`.

```jsx
function renderComponent(children, dataFetchProps = {}) {
  return render( // some render function for your testing library
    <DataFetchProvider {...dataFetchProps}>
      {children}
    </DataFetchProvider>
  )
}

test('creates a new thing', async () => {
  let data
  const dataFetchInstance = (requestData) => {
    data = requestData
    return Promise.resolve({ data: { message: { id: 1 } } })
  }
  const component = renderComponent(<MyComponent />, { dataFetchInstance })
  ... your test
})
```

By creating a data function that accepts the requestData normally passed into axios that in turn returns a promise, you match the api of axios. The `data` variable can be set to the requestData and you can assert on the data being sent by any component using `useDataFetch`.

Note that in this instance it assumes that your components will only make a single call. To capture the output of multiple calls, do the following:

```jsx
test('creates a new thing', async () => {
  const data = []
  const dataFetchInstance = (requestData) => {
    data.push(requestData)
    return Promise.resolve({ data: { message: { id: 1 } } })
  }
  const component = renderComponent(<MyComponent />, { dataFetchInstance })
  ... your test
  expect(data[0]).toEqual(..somedata)
  expect(data[1]).toEqual(..somedifferentData)
})
```

In a non-deterministic scenario (where it is unclear which order the calls will be made), it is recommended to filter for each call in the data array to perform your search (such as by the path of the data sent by axios):

```jsx
const firstExpectedCall = data.find((d) => d.url == 'expected/1')
const secondExpectedCall = data.find((d) => d.url == 'expected/2')
```

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

## Contributing

- Keep it respectful
- Search issues for possible known issues (and help resolve them :))
- Always add some form of test (see Testing) to any pull requests (or make a case for why the change is already covered)
- Always update README.md with any new features/changes to behavior or usage.
- Update CHANGELOG.md with each pull request (unless it makes sense not to)

## Troubleshooting

1. If you install into another project locally (using `npm install <folder>`) be sure to follow the advice found here [https://stackoverflow.com/questions/56021112/react-hooks-in-react-library-giving-invalid-hook-call-error](https://stackoverflow.com/questions/56021112/react-hooks-in-react-library-giving-invalid-hook-call-error)
