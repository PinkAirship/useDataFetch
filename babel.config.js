module.exports = (api) => {
  // api.cache(true)
  return {
    presets: [
      api.env('development') && '@babel/preset-env',
      api.env('development') && '@babel/preset-react',
    ].filter(Boolean),
    plugins: [
      'transform-react-jsx',
      api.env('development') &&
        '@babel/plugin-proposal-object-rest-spread',
      api.env('development') && '@babel/plugin-transform-runtime',
    ].filter(Boolean),
  }
}
