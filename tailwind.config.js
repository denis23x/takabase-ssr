module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    "text-2xl",
    "text-xl",
    "text-lg",
    "text-base",
    "text-sm",
    "text-xs",
    "alert-info",
    "alert-success",
    "alert-warning",
    "alert-error",
  ],
  theme: {
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
  plugins: [require("@tailwindcss/line-clamp"), require("daisyui")],
}
