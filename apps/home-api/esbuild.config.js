const esbuild = require('esbuild')

const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve 
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }))

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, args => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }))

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => ({
      path: args.path,
      namespace: 'file',
    }))

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  },
}

const optionalDepsPlugins = {
  name: 'optionalDepsPlugin',
  async setup(build) {
    const options = { ...build.initialOptions }
    options.plugins = options.plugins.filter(p => p.name !== 'optionalDepsPlugin')

    const errors = []
    try {
      const b = await esbuild.build({...options, logLevel: 'silent'})
    } catch(e) {
      if (e.errors) errors.push(...e.errors
          .map(e => {
            return {
              importer: process.cwd() + '/' + e.location.file,
              path: e.location.lineText.match(/require\(['"]([^"']+)['"]\)/)[1]
            }
          }))

    }

    build.onResolve({ filter: /.+/ }, args => {
      if (errors.find(e => e.path === args.path && e.importer === args.importer)) {
        console.warn(`Optional dependency detected "${args.path}" in ${args.importer} `)
        return { external: true, path: args.path }
      }
    })
  }
}

module.exports = {
  plugins: [nativeNodeModulesPlugin, optionalDepsPlugins],
}