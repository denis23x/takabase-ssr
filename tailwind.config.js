const colors = require("tailwindcss/colors")

delete colors["lightBlue"]

module.exports = {
  mode: "jit",
  purge: {
    enabled: true,
    content: ["./src/**/*.html"],
    options: {
      keyframes: true,
      fontFace: true,
    },
  },
  theme: {
    fontFamily: {
      sans: ["Ubuntu", "sans-serif"],
    },
    colors: {
      ...colors,
      ["primary-1"]: "var(--primary-1)",
      ["primary-2"]: "var(--primary-2)",
      ["primary-3"]: "var(--primary-3)",
      ["primary-4"]: "var(--primary-4)",
      ["secondary-1"]: "var(--secondary-1)",
      ["secondary-2"]: "var(--secondary-2)",
      ["info-1"]: "var(--info-1)",
      ["success-1"]: "var(--success-1)",
      ["warning-1"]: "var(--warning-1)",
      ["danger-1"]: "var(--danger-1)",
      ["transparent"]: "transparent",
    },
    cursor: {
      ["default"]: "default",
      ["pointer"]: "pointer",
      ["not-allowed"]: "not-allowed",
      ["col-resize"]: "col-resize",
      ["row-resize"]: "row-resize",
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
        ["xs"]: "375px",
      },
      spacing: {
        128: "32rem",
        192: "48rem",
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
