module.exports = (api) => {
  // api.cache(true)
  return {
    presets: [
      api.env(['development', 'test']) && '@babel/preset-env',
      api.env(['development', 'test']) && '@babel/preset-react',
    ].filter(Boolean),
    plugins: [
      'transform-react-jsx',
      api.env(['development', 'test']) &&
        '@babel/plugin-proposal-object-rest-spread',
      api.env(['development', 'test']) &&
        '@babel/plugin-transform-runtime',
    ].filter(Boolean),
  }
}
