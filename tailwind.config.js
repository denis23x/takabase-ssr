module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    "bg-info-1",
    "bg-success-1",
    "bg-warning-1",
    "bg-danger-1",
    "text-white",
    "text-black",
  ],
  theme: {
    fontFamily: {
      sans: ["Ubuntu", "sans-serif"],
    },
    colors: {
      ["current"]: "currentColor",
      ["transparent"]: "transparent",

      /**
       * Colors opacity issue handler
       * https://github.com/adamwathan/tailwind-css-variable-text-opacity-demo
       **/

      ...(() => {
        const colors = {}
        const variables = [
          "white",
          "black",
          "primary-1",
          "primary-2",
          "primary-3",
          "primary-4",
          "secondary-1",
          "secondary-2",
          "info-1",
          "success-1",
          "warning-1",
          "danger-1",
        ]

        variables.forEach((variable) => {
          colors[variable] = ({ opacityVariable, opacityValue }) => {
            if (opacityValue !== undefined) {
              return `rgba(var(--${variable}), ${opacityValue})`
            }

            if (opacityVariable !== undefined) {
              return `rgba(var(--${variable}), var(${opacityVariable}, 1))`
            }

            return `rgb(var(--${variable}))`
          }
        })

        return colors
      })(),
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
        256: "64rem",
      },
      maxWidth: {
        128: "32rem",
        192: "48rem",
        256: "64rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
}
