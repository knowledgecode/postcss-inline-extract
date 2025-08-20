import { describe, test, expect } from 'vitest';
import { extractStyles, format } from '../src/extract.ts';
import type { PluginOptions } from '../src/extract.ts';

describe('extractStyles function', () => {
  test('extracts inline styles from HTML elements', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="color: red; font-size: 14px;" class="test">Hello</div>',
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.test', props: ['color: red', 'font-size: 14px'] }
    ]);
  });

  test('handles class selector generation', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="color: blue;" class="my-class another-class">Hello</div>',
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.my-class.another-class', props: ['color: blue'] }
    ]);
  });

  test('handles id selector generation', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="margin: 10px;" id="unique-id">Hello</div>',
      selector: 'id',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '#unique-id', props: ['margin: 10px'] }
    ]);
  });

  test('generates hash selector when no class or id available', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="padding: 5px;">Hello</div>',
      selector: 'hash',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toHaveLength(1);
    expect(result[0].selector).toMatch(/^\.[a-z][a-z0-9]*$/); // Hash pattern
    expect(result[0].props).toEqual(['padding: 5px']);
  });

  test('merges properties from elements with same selector', () => {
    const options: Required<PluginOptions> = {
      html: `
        <div style="color: red;" class="test">Hello</div>
        <div style="font-size: 16px;" class="test">World</div>
      `,
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.test', props: ['color: red', 'font-size: 16px'] }
    ]);
  });

  test('handles multiple selector types priority', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="color: green;" class="my-class" id="my-id">Hello</div>',
      selector: ['class', 'id'],
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.my-class', props: ['color: green'] }
    ]);
  });

  test('ignores style tags when styleTags is false', () => {
    const options: Required<PluginOptions> = {
      html: `
        <style>.existing { margin: 10px; }</style>
        <div style="color: red;" class="test">Hello</div>
      `,
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.test', props: ['color: red'] }
    ]);
  });

  test('extracts from style tags when styleTags is true', () => {
    const options: Required<PluginOptions> = {
      html: `
        <style>.existing { margin: 10px; }</style>
        <div style="color: red;" class="test">Hello</div>
      `,
      selector: 'class',
      styleTags: true,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.test', props: ['color: red'] },
      { selector: '.existing', props: ['margin: 10px'] }
    ]);
  });

  test('handles complex CSS selectors from style tags', () => {
    const options: Required<PluginOptions> = {
      html: `
        <style>
          .parent > .child { color: blue; }
          .item:hover { background: yellow; }
          #specific { font-weight: bold; }
        </style>
      `,
      selector: 'class',
      styleTags: true,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.parent > .child', props: ['color: blue'] },
      { selector: '.item:hover', props: ['background: yellow'] },
      { selector: '#specific', props: ['font-weight: bold'] }
    ]);
  });

  test('handles empty HTML', () => {
    const options: Required<PluginOptions> = {
      html: '',
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([]);
  });

  test('handles malformed style attributes', () => {
    const options: Required<PluginOptions> = {
      html: '<div style="color: red; ; margin;" class="test">Hello</div>',
      selector: 'class',
      styleTags: false,
      indent: 2
    };

    const result = extractStyles(options);
    expect(result).toEqual([
      { selector: '.test', props: ['color: red', 'margin'] }
    ]);
  });
});

describe('format function', () => {
  test('formats styles with default indentation', () => {
    const styles = [
      { selector: '.test', props: ['color: red', 'font-size: 14px'] }
    ];

    const result = format(styles, 2);
    expect(result).toBe(`.test {
  color: red;
  font-size: 14px;
}
`);
  });

  test('formats styles with custom indentation', () => {
    const styles = [
      { selector: '.test', props: ['color: blue'] }
    ];

    const result = format(styles, 4);
    expect(result).toBe(`.test {
    color: blue;
}
`);
  });

  test('formats multiple selectors', () => {
    const styles = [
      { selector: '.first', props: ['color: red'] },
      { selector: '.second', props: ['margin: 10px', 'padding: 5px'] }
    ];

    const result = format(styles, 2);
    expect(result).toBe(`.first {
  color: red;
}

.second {
  margin: 10px;
  padding: 5px;
}
`);
  });

  test('handles empty styles array', () => {
    const styles: { selector: string; props: string[] }[] = [];

    const result = format(styles, 2);
    expect(result).toBe('');
  });

  test('handles selector with no properties', () => {
    const styles = [
      { selector: '.empty', props: [] }
    ];

    const result = format(styles, 2);
    expect(result).toBe(`.empty {
}
`);
  });
});
