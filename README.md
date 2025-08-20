# PostCSS Inline Extract

[<img src="https://postcss.org/logo.svg" alt="PostCSS Logo" width="90" height="90" align="right">][PostCSS]

[![CI](https://github.com/knowledgecode/postcss-inline-extract/actions/workflows/ci.yml/badge.svg)](https://github.com/knowledgecode/postcss-inline-extract/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/postcss-inline-extract)](https://www.npmjs.com/package/postcss-inline-extract)

[PostCSS] plugin to extract inline styles from HTML and convert them to CSS rules.

This plugin helps you extract `style` attributes from HTML elements and convert them into structured CSS rules with customizable selectors.

```css
/* Input CSS (empty or existing styles) */

/* HTML input with inline styles */
<div style="color: red; margin: 10px;" class="button">Click me</div>
<span style="font-size: 14px;" id="text">Hello</span>
```

```css
/* Output CSS */
.button {
  color: red;
  margin: 10px;
}

#text {
  font-size: 14px;
}
```

## Features

- Extract inline styles from HTML `style` attributes
- Multiple selector generation strategies (class, id, hash)
- Optional extraction from `<style>` tags
- Automatic property merging for duplicate selectors
- TypeScript support with full type definitions
- Fast and lightweight with minimal dependencies

## Installation

```bash
npm install --save-dev postcss postcss-inline-extract
```

## Usage

### Basic Usage

```javascript
const postcss = require('postcss');
const inlineExtract = require('postcss-inline-extract');

const html = `
  <div style="color: red; margin: 10px;" class="button">Click me</div>
  <span style="font-size: 14px;" class="text">Hello</span>
`;

postcss([
  inlineExtract({ html })
])
  .process('', { from: undefined })
  .then(result => {
    console.log(result.css);
    /*
    .button {
      color: red;
      margin: 10px;
    }
    .text {
      font-size: 14px;
    }
    */
  });
```

### With PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-inline-extract')({
      html: require('fs').readFileSync('src/index.html', 'utf8')
    })
  ]
};
```

## Options

### `html` (required)

Type: `string`

The HTML content to extract inline styles from.

```javascript
inlineExtract({
  html: '<div style="color: red;" class="button">Click me</div>'
})
```

### `selector`

Type: `'class' | 'id' | 'hash' | Array<'class' | 'id' | 'hash'>`  
Default: `'class'`

Strategy for generating CSS selectors:

- `'class'`: Use existing `class` attribute (`.className`). Elements without a `class` attribute will be ignored.
- `'id'`: Use existing `id` attribute (`#idName`). Elements without an `id` attribute will be ignored.
- `'hash'`: Generate random hash selectors (`.abc123`) for all elements with inline styles.

```javascript
// Use class attributes
inlineExtract({
  html: htmlContent,
  selector: 'class'
})

// Use ID attributes
inlineExtract({
  html: htmlContent,
  selector: 'id'
})

// Priority order: try class first, then id
inlineExtract({
  html: htmlContent,
  selector: ['class', 'id']
})
```

### `styleTags`

Type: `boolean`  
Default: `false`

Whether to also extract CSS from `<style>` tags in the HTML.

```javascript
inlineExtract({
  html: `
    <style>
      .existing { margin: 20px; }
    </style>
    <div style="color: red;" class="button">Click me</div>
  `,
  styleTags: true
})
```

### `indent`

Type: `number`  
Default: `2`

Number of spaces for CSS indentation.

```javascript
inlineExtract({
  html: htmlContent,
  indent: 4
})
```

## Examples

### Multiple Classes (Compound Selectors)

```html
<div style="color: blue; padding: 15px;" class="button primary large">
  Submit Button
</div>
```

```css
/* Output: Creates compound selector from multiple classes */
.button.primary.large {
  color: blue;
  padding: 15px;
}
```

### Multiple Elements with Same Class

```html
<div style="color: red;" class="button">Button 1</div>
<div style="margin: 10px;" class="button">Button 2</div>
```

```css
/* Output: Properties are automatically merged */
.button {
  color: red;
  margin: 10px;
}
```

### Hash Selector Generation

```html
<div style="color: blue;">No class or ID</div>
```

```javascript
inlineExtract({
  html: htmlContent,
  selector: 'hash'
})
```

```css
/* Output: Random hash selector */
.a1b2c3 {
  color: blue;
}
```

## TypeScript Support

This plugin includes full TypeScript definitions:

```typescript
import postcss from 'postcss';
import inlineExtract, { PluginOptions, SelectorType } from 'postcss-inline-extract';

const options: PluginOptions = {
  html: '<div style="color: red;" class="button">Click me</div>',
  selector: 'class' as SelectorType,
  styleTags: false,
  indent: 2
};

const processor = postcss([inlineExtract(options)]);
```

## License

[MIT License](LICENSE)

[PostCSS]: https://github.com/postcss/postcss
