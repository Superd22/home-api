const { nodeExternalsPlugin } = require('esbuild-node-externals');
const { esbuildDecorators } = require('@anatine/esbuild-decorators');

module.exports = {
  plugins: [
    esbuildDecorators(),
    nodeExternalsPlugin({ packagePath: '/home/david/perso/home-api/package.json' }),
  ],
  sourcemap: true
}