import { PluginCreator, parse } from 'postcss';
import { extractStyles, format } from './extract.ts';
import type { PluginOptions } from './extract.ts';
export type { PluginOptions, SelectorType } from './extract.ts';

const plugin: PluginCreator<PluginOptions> = opts => {
  const options: Required<PluginOptions> = {
    html: opts?.html ?? '',
    selector: opts?.selector ?? 'class',
    styleTags: opts?.styleTags ?? false,
    indent: typeof opts?.indent === 'number' && opts.indent > 0 ? opts.indent : 2
  };

  return {
    postcssPlugin: 'postcss-inline-extract',
    Once: root => {
      try {
        const css = format(extractStyles(options), options.indent);
        const parsedRoot = parse(css);
        const source = root.source;

        if (source) {
          parsedRoot.each(node => { node.source = source; });
        }
        root.removeAll();
        root.append(parsedRoot.nodes);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error occurred';
        root.error(`Failed to extract inline styles: ${message}`, { plugin: 'postcss-inline-extract' });
      }
    }
  };
};

plugin.postcss = true;

export default plugin;
