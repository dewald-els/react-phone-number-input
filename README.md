# React Phone Number format with Virtual keyboard

Allow using the React Simple Keyboard package with the libphonenumber-js package.

## Why?

The caret positioning of inputs are out of sync when the values are formatted by the libphonenumber-js plugin.

## Solution

Create a hidden input that stored the actual value that is entered. This value is NOT formatted and thus, allows the React Simple Keyboard package to track the current cursor position.

An additional component is rendered that displays the formatted value. The current cursor position is inherited from the React Simple Keyboard and translated to the displayed input.

## Links

- [React Simple Keyboard](https://www.npmjs.com/package/react-simple-keyboard)
- [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js)
- [Flag CDN](https://flagcdn.com)
