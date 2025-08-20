import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index.ts';
import type { PluginOptions } from '../src/index.ts';

const run = async (input: string, output: string, options: PluginOptions) => {
  const result = await postcss([plugin(options)])
    .process(input, { from: undefined });
  expect(result.css.trim()).toBe(output.trim());
  expect(result.warnings()).toHaveLength(0);
};

describe('postcss-inline-extract plugin', () => {
  test('extracts inline styles with class selector', async () => {
    const html = '<div style="color: red; font-size: 14px;" class="test">Hello</div>';

    await run(
      '', // Input CSS
      `.test {
  color: red;
  font-size: 14px;
}`, // Expected output
      { html, selector: 'class' }
    );
  });

  test('extracts inline styles with id selector', async () => {
    const html = '<div style="color: blue; margin: 10px;" id="myid">Hello</div>';

    await run(
      '',
      `#myid {
  color: blue;
  margin: 10px;
}`,
      { html, selector: 'id' }
    );
  });

  test('generates hash selector when no class or id', async () => {
    const html = '<div style="color: green;">Hello</div>';

    const result = await postcss([plugin({ html, selector: 'hash' })])
      .process('', { from: undefined });

    // Verify that a hash selector is generated
    expect(result.css).toMatch(/\.[a-z0-9]+ \{\n {2}color: green;\n\}/);
  });

  test('handles multiple elements with same class', async () => {
    const html = `
      <div style="color: red;" class="test">Hello</div>
      <span style="font-size: 16px;" class="test">World</span>
    `;

    await run(
      '',
      `.test {
  color: red;
  font-size: 16px;
}`,
      { html, selector: 'class' }
    );
  });

  test('respects styleTags option (default: false)', async () => {
    const html = `
      <style>.existing { margin: 10px; }</style>
      <div style="color: red;" class="test">Hello</div>
    `;

    // styleTags: false (default) - style tags are ignored
    await run('',
      `.test {
  color: red;
}`,
      { html }
    );
  });

  test('extracts from style tags when styleTags: true', async () => {
    const html = `
      <style>.existing { margin: 10px; }</style>
      <div style="color: red;" class="test">Hello</div>
    `;

    await run('',
      `.test {
  color: red;
}

.existing {
  margin: 10px;
}`,
      { html, styleTags: true }
    );
  });

  test('handles selector priority order', async () => {
    const html = '<div style="color: red;" class="myclass" id="myid">Hello</div>';

    // Class priority
    await run('', '.myclass {\n  color: red;\n}', {
      html,
      selector: ['class', 'id']
    });

    // ID priority (when class exists, class takes precedence due to current logic)
    await run('', '.myclass {\n  color: red;\n}', {
      html,
      selector: ['id', 'class']
    });
  });

  test('respects custom indent option', async () => {
    const html = '<div style="color: red;" class="test">Hello</div>';

    await run(
      '',
      `.test {
    color: red;
}`, // 4-space indent
      { html, indent: 4 }
    );
  });

  test('handles complex style properties', async () => {
    const html = '<div style="color: red; font-family: &quot;Arial&quot;, sans-serif; margin: 10px 20px;" class="test">Hello</div>';

    await run(
      '',
      `.test {
  color: red;
  font-family: "Arial", sans-serif;
  margin: 10px 20px;
}`,
      { html, selector: 'class' }
    );
  });

  test('merges duplicate properties correctly', async () => {
    const html = `
      <div style="color: red; margin: 10px;" class="test">Hello</div>
      <div style="color: red; padding: 5px;" class="test">World</div>
    `;

    await run(
      '',
      `.test {
  color: red;
  margin: 10px;
  padding: 5px;
}`,
      { html, selector: 'class' }
    );
  });

  test('handles empty HTML', async () => {
    await run('', '', { html: '' });
  });

  test('handles HTML without style attributes', async () => {
    const html = '<div class="test">Hello</div>';

    await run('', '', { html, selector: 'class' });
  });

  test('handles malformed style attributes gracefully', async () => {
    const html = '<div style="color: red; invalid-property;" class="test">Hello</div>';

    // Current implementation extracts all properties in style attribute
    await run(
      '',
      '',  // Empty because "invalid-property;" has no value, so no valid CSS is generated
      { html, selector: 'class' }
    );
  });
});
