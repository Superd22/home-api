const { nodeExternalsPlugin } = require('esbuild-node-externals');
const { esbuildDecorators } = require('@anatine/esbuild-decorators');

module.exports = {
  plugins: [
    esbuildDecorators(),
    nodeExternalsPlugin({ packagePath: __dirname+'/../../package.json' }),
  ],
  sourcemap: true
}