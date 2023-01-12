module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    /** SNACKBAR  */

    "alert-info",
    "alert-success",
    "alert-warning",
    "alert-error",

    /** MARKDOWN  */

    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "font-thin",
    "font-extralight",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
    "font-black",
    "underline",
    "overline",
    "line-through",
    "no-underline",
    "italic",
    "not-italic",

    /** WINDOW  */

    "w-full",
    "h-full",
    "justify-between",

    "left-4",
    "top-1/2",
    "h-auto",
    "max-h-[calc(100vh-2rem)]",
    "w-full",
    "max-w-[calc(100vw-2rem)]",
    "-translate-y-1/2",
    "border",
    "border-base-content/20",
    "md:left-1/2",
    "md:max-h-[75vh]",
    "md:max-w-[640px]",
    "md:-translate-x-1/2",
    "shadow-xl",
    "rounded-box",

    /** FULLSCREEN */

    "fixed",
    "top-0",
    "left-0",
    "!m-0",
    "w-full",
    "h-full",

    "border",
    "border-base-content/20",
    "rounded-box",
    "shadow-xl",
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
      screens: {
        ["mouse"]: {
          raw: "(hover: hover) and (pointer: fine)",
        },
        ["touch"]: {
          raw: "(hover: none) and (pointer: coarse)",
        },
      },
    },
  },
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
}
