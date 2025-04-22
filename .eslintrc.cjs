/* eslint-env node */
module.exports = {
  extends: ["plugin:astro/recommended"],
  rules: {
    "linebreak-style": "off",
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
    },
  ],
};
