const colorVariableList = [
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

module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    ...colorVariableList.map((variable) => "bg-" + variable),
    ...colorVariableList.map((variable) => "text-" + variable),
    "text-2xl",
    "text-xl",
    "text-lg",
    "text-base",
    "text-sm",
    "text-xs",
  ],
  theme: {
    // fontFamily: {
    //   sans: ["Ubuntu", "sans-serif"],
    // },
    // colors: {
    //   ["current"]: "currentColor",
    //   ["transparent"]: "transparent",
    //
    //   /**
    //    * Colors opacity issue handler
    //    * https://github.com/adamwathan/tailwind-css-variable-text-opacity-demo
    //    **/
    //
    //   ...(() => {
    //     const colorList = {}
    //
    //     colorVariableList.forEach((variable) => {
    //       colorList[variable] = ({ opacityVariable, opacityValue }) => {
    //         if (opacityValue !== undefined) {
    //           return `rgba(var(--${variable}), ${opacityValue})`
    //         }
    //
    //         if (opacityVariable !== undefined) {
    //           return `rgba(var(--${variable}), var(${opacityVariable}, 1))`
    //         }
    //
    //         return `rgb(var(--${variable}))`
    //       }
    //     })
    //
    //     return colorList
    //   })(),
    // },
    cursor: {
      ["default"]: "default",
      ["pointer"]: "pointer",
      ["not-allowed"]: "not-allowed",
      ["col-resize"]: "col-resize",
      ["row-resize"]: "row-resize",
    },
    extend: {
      scale: {
        "-1": "-1",
      },
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
        64: "16rem",
        128: "32rem",
        192: "48rem",
        256: "64rem",
      },
    },
  },
  plugins: [
    // require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("daisyui"),
  ],
}
