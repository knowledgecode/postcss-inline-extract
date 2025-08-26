import esbuild from 'rollup-plugin-esbuild';
import { dts } from 'rollup-plugin-dts';
import license from 'rollup-plugin-license';

export default () => {
  return [
    {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'cjs'
      },
      external: [
        'node-html-parser',
        'postcss'
      ],
      plugins: [
        esbuild({ target: 'es2018' }),
        license({
          banner: '@license\nCopyright 2025 KNOWLEDGECODE\nSPDX-License-Identifier: MIT\n'
        })
      ]
    },
    {
      input: 'src/index.ts',
      output: [
        { dir: 'dist' }
      ],
      plugins: [
        dts()
      ]
    }
  ];
};
