import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index.ts';
import type { PluginOptions } from '../src/index.ts';

describe('error handling', () => {
  test('handles malformed HTML gracefully', async () => {
    const html = '<div style="color: red;" class="test">Unclosed div';

    const result = await postcss([plugin({ html })])
      .process('', { from: undefined });

    // Should not throw and should extract valid styles
    expect(result.css.trim()).toBe(`.test {
  color: red;
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles invalid CSS properties in style attribute', async () => {
    const html = '<div style="color: red; invalid-property: value; margin: 10px;" class="test">Hello</div>';

    const result = await postcss([plugin({ html })])
      .process('', { from: undefined });

    // Current implementation extracts all properties (including invalid ones)
    expect(result.css.trim()).toBe(`.test {
  color: red;
  invalid-property: value;
  margin: 10px;
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles empty style attribute', async () => {
    const html = '<div style="" class="test">Hello</div>';

    const result = await postcss([plugin({ html })])
      .process('', { from: undefined });

    // Current implementation creates selector even with empty styles
    expect(result.css.trim()).toBe(`.test {
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles whitespace-only style attribute', async () => {
    const html = '<div style="   " class="test">Hello</div>';

    const result = await postcss([plugin({ html })])
      .process('', { from: undefined });

    // Current implementation creates selector even with whitespace-only styles
    expect(result.css.trim()).toBe(`.test {
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles malformed CSS in style tags', async () => {
    const html = `
      <style>
        .valid { color: red; }
        .invalid { color: red
        .another { margin: 10px; }
      </style>
    `;

    const result = await postcss([plugin({ html, styleTags: true })])
      .process('', { from: undefined });

    // Malformed CSS in style tags causes PostCSS to fail, resulting in empty output
    expect(result.css.trim()).toBe('');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles elements without class or id when using class/id selector', async () => {
    const html = '<div style="color: red;">No class or id</div>';

    const result = await postcss([plugin({ html, selector: 'class' })])
      .process('', { from: undefined });

    // Should produce empty output when no class is found
    expect(result.css.trim()).toBe('');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles nested HTML structures', async () => {
    const html = `
      <div style="color: red;" class="parent">
        <span style="font-size: 14px;" class="child">
          <strong style="font-weight: bold;" class="grandchild">Text</strong>
        </span>
      </div>
    `;

    const result = await postcss([plugin({ html, selector: 'class' })])
      .process('', { from: undefined });

    // Should extract all styles from nested elements
    expect(result.css).toContain('.parent {\n  color: red;\n}');
    expect(result.css).toContain('.child {\n  font-size: 14px;\n}');
    expect(result.css).toContain('.grandchild {\n  font-weight: bold;\n}');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles HTML entities in style values', async () => {
    const html = '<div style="content: &quot;Hello&quot;;" class="test">Hello</div>';

    const result = await postcss([plugin({ html })])
      .process('', { from: undefined });

    // Should properly decode HTML entities
    expect(result.css.trim()).toBe(`.test {
  content: "Hello";
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles very large HTML input', async () => {
    // Generate large HTML with many elements
    const elements = Array.from({ length: 1000 }, (_, i) => `
      <div style="color: rgb(${i % 255}, 0, 0);" class="item-${i}">Item ${i}</div>
    `).join('\n');

    const html = `<div>${elements}</div>`;

    const result = await postcss([plugin({ html, selector: 'class' })])
      .process('', { from: undefined });

    // Should handle large input without errors
    expect(result.css.length).toBeGreaterThan(1000);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles special characters in class names', async () => {
    const html = '<div style="color: red;" class="test-class_name with-dashes">Hello</div>';

    const result = await postcss([plugin({ html, selector: 'class' })])
      .process('', { from: undefined });

    // Should handle special characters in class names
    expect(result.css.trim()).toBe(`.test-class_name.with-dashes {
  color: red;
}`);
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles missing html option', async () => {
    const result = await postcss([plugin({} as PluginOptions)])
      .process('', { from: undefined });

    // Should handle missing html option gracefully
    expect(result.css.trim()).toBe('');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles undefined html option', async () => {
    const result = await postcss([plugin({ html: undefined as unknown } as PluginOptions)])
      .process('', { from: undefined });

    // Should handle undefined html option gracefully
    expect(result.css.trim()).toBe('');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles CSS parsing errors in style tags', async () => {
    const html = `
      <style>
        @import "non-existent.css";
        .valid { color: red; }
        @invalid-at-rule;
      </style>
    `;

    const result = await postcss([plugin({ html, styleTags: true })])
      .process('', { from: undefined });

    // Should extract valid parts and handle invalid CSS gracefully
    expect(result.css).toContain('.valid {\n  color: red;\n}');
    expect(result.warnings()).toHaveLength(0);
  });

  test('handles circular or self-referencing HTML', async () => {
    const html = '<div style="color: red;" class="test"><div style="margin: 10px;" class="test">Nested same class</div></div>';

    const result = await postcss([plugin({ html, selector: 'class' })])
      .process('', { from: undefined });

    // Should merge properties from elements with same class
    expect(result.css.trim()).toBe(`.test {
  color: red;
  margin: 10px;
}`);
    expect(result.warnings()).toHaveLength(0);
  });
});
