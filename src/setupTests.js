// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("text-encoding").TextEncoder;
  global.crypto = require("crypto");
}
