const colors = require("tailwindcss/colors")

delete colors["lightBlue"]

module.exports = {
  mode: "jit",
  purge: {
    enabled: true,
    content: ["./src/**/*.html"],
    options: {
      safelist: ["dark"],
      keyframes: true,
      fontFace: true,
    },
  },
  theme: {
    colors: {
      ...colors,
      ["color-1"]: "var(--color-1)",
      ["color-2"]: "var(--color-2)",
      ["color-3"]: "var(--color-3)",
      ["color-4"]: "var(--color-4)",
      ["color-5"]: "var(--color-5)",
      ["color-6"]: "var(--color-6)",
      ["color-7"]: "var(--color-7)",
      ["color-8"]: "var(--color-8)",
      ["color-9"]: "var(--color-9)",
      ["transparent"]: "transparent",
    },
    extend: {
      saturate: {
        75: ".75",
      },
      gridTemplateColumns: {
        ["posts"]: "repeat(auto-fill, minmax(theme('width.40'), 1fr))",
        ["users"]: "repeat(auto-fill, minmax(theme('width.60'), 1fr))",
      },
      screens: {
        ["mouse"]: {
          raw: "(hover: hover) and (pointer: fine)",
        },
        ["touch"]: {
          raw: "(hover: none) and (pointer: coarse)",
        },
        ["2xl"]: "1920px",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["active", "disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
}
