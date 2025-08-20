import { parse as htmlParse } from 'node-html-parser';
import { parse } from 'postcss';

export type SelectorType = 'class' | 'id' | 'hash';

export interface PluginOptions {
  html: string;
  selector?: SelectorType | SelectorType[];
  styleTags?: boolean;
  indent?: number;
}

interface Style {
  selector: string,
  props: string[]
}

/**
 * Formats a class selector.
 * @param selector - The selector to format.
 * @returns The formatted class selector.
 */
const formatClass = (selector: string) => {
  return selector.trim()
    .replace(/^([^.])/, '.$1')
    .replace(/  +/g, ' ')
    .replace(/ /g, '.');
};

/**
 *  Formats an ID selector.
 * @param selector - The selector to format.
 * @returns The formatted ID selector.
 */
const formatId = (selector: string) => {
  return selector.trim()
    .replace(/^([^#])/, '#$1');
};

/**
 * Formats a selector by adding spaces around combinators and commas.
 * @param selector - The selector to format.
 * @returns The formatted selector.
 */
const formatSelector = (selector: string) => {
  return selector.trim()
    .replace(/>/g, ' > ')
    .replace(/ +,/g, ', ')
    .replace(/  +/g, ' ');
};

/**
 * Formats style properties into an array.
 * @param props - The style properties to format.
 * @returns An array of formatted style properties.
 */
const formatProps = (props: string | undefined) => {
  return props?.split(';').reduce((list: string[], prop) => {
    if (prop.trim()) {
      list.push(prop.split(':').map(kv => kv.trim()).join(': '));
    }
    return list;
  }, []).sort() || [];
};

/**
 * Generates a selector based on class, ID, or a random hash.
 * @param className - The class name to use in the selector.
 * @param id - The ID to use in the selector.
 * @param selector - The type of selector to generate.
 * @returns The generated selector.
 */
const generateSelector = (className: string, id: string, selector: SelectorType | SelectorType[]) => {
  const template = /^\d/;
  const generateHash = () => {
    let hash = '';

    do {
      hash = Math.random().toString(36).slice(2);
    } while (template.test(hash));
    return hash;
  };

  return (Array.isArray(selector) ? selector : [selector]).reduce((name, type) => {
    return name || type === 'class' ?
      formatClass(className || '') : type === 'id' ?
        formatId(id || '') : `.${generateHash()}`;
  }, '');
};

/**
 * Compares two selectors to determine if they are equivalent.
 * @param selector1 - The first selector to compare.
 * @param selector2 - The second selector to compare.
 * @returns True if the selectors are equivalent, false otherwise.
 */
const compareSelector = (selector1: string, selector2: string) => {
  return /[\s>+~(),]/.test(selector1) || /[\s>+~(),]/.test(selector2)
    ? selector1 === selector2
    : selector1.split('.').sort().join('.') === selector2.split('.').sort().join('.');
};

/**
 * Merges two sets of properties, ensuring no duplicates and sorting the result.
 * @param props1 - The first set of properties.
 * @param props2 - The second set of properties.
 * @returns A sorted array of merged properties.
 */
const mergeProps = (props1: string[], props2: string[]) => {
  const props = props1.slice();

  for (const prop of props2) {
    if (props.indexOf(prop) < 0) {
      props.push(prop);
    }
  }
  return props.sort();
};

/**
 * Extracts styles from the provided HTML content based on the specified options.
 * @param options - The options for extracting styles.
 * @returns An array of extracted styles, each with a selector and properties.
 */
export const extractStyles = (options: Required<PluginOptions>) => {
  const { html, selector, styleTags } = options;
  const context = htmlParse(html);
  const result: Style[] = [];

  for (const el of context.querySelectorAll('[style]')) {
    const value = generateSelector(el.attributes.class || '', el.attributes.id || '', selector);

    if (value) {
      const index = result.findIndex(style => compareSelector(style.selector, value));

      if (index > -1 && result[index]) {
        result[index].props = mergeProps(result[index].props, formatProps(el.attributes.style));
      } else {
        result.push({
          selector: value,
          props: formatProps(el.attributes.style)
        });
      }
    }
  }
  if (styleTags) {
    for (const el of context.querySelectorAll('style')) {
      parse(el.textContent).walkRules(rule => {
        const value = formatSelector(rule.selector);
        const props = rule.nodes.filter(node => node.type === 'decl').map(decl => `${decl.prop}: ${decl.value}`);
        const index = result.findIndex(style => compareSelector(style.selector, value));

        if (index > -1 && result[index]) {
          result[index].props = mergeProps(result[index].props, props);
        } else {
          result.push({
            selector: value,
            props
          });
        }
      });
    }
  }
  return result;
};

/**
 * Formats the extracted styles into a string of CSS.
 * @param styles - The styles to format.
 * @param indent - The number of spaces to use for indentation.
 * @returns A formatted string of CSS styles.
 */
export const format = (styles: Style[], indent: number) => {
  const line = [];

  for (const { selector, props } of styles) {
    line.push(`${selector} {`);
    for (const prop of props) {
      line.push(`${''.padStart(indent, ' ')}${prop};`);
    }
    line.push('}\n');
  }
  return line.join('\n');
};
