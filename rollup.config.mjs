import esbuild from 'rollup-plugin-esbuild';

export default () => {
  return [
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.js',
        format: 'cjs'
      },
      external: [
        'node-html-parser',
        'postcss'
      ],
      plugins: [
        esbuild({ target: 'es2018' })
      ]
    }
  ];
};
