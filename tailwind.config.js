module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
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

    "top-1/2",
    "left-1/2",
    "h-auto",
    "w-auto",
    "max-h-[calc(100vh-2rem)]",
    "max-w-[calc(100vw-2rem)]",
    "-translate-y-1/2",
    "-translate-x-1/2",
    "border",
    "border-base-content/20",
    "md:max-h-[80vh]",
    "md:max-w-[calc(768px-4rem)]",
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
    "bg-primary",
    "text-primary-content",
    "align-middle",
    "-translate-y-0.5",
    "!rounded",
    "!my-0",
    "!mr-4",

    "alert",
    "alert-info",
    "alert-success",
    "alert-warning",
    "alert-error",

    "link",
    "link-neutral",
    "link-primary",
    "link-secondary",
    "link-accent",
    "link-info",
    "link-success",
    "link-warning",
    "link-error",

    "btn",
    "btn-primary",
    "btn-secondary",
    "btn-accent",
    "btn-info",
    "btn-success",
    "btn-warning",
    "btn-error",
    "btn-ghost",
    "btn-link",
    "btn-outline",
    "btn-lg",
    "btn-md",
    "btn-sm",
    "btn-xs",

    "badge",
    "badge-primary",
    "badge-secondary",
    "badge-accent",
    "badge-info",
    "badge-success",
    "badge-warning",
    "badge-error",
    "badge-ghost",
    "badge-link",
    "badge-outline",
    "badge-lg",
    "badge-md",
    "badge-sm",
    "badge-xs",

    "kbd",
    "kbd-lg",
    "kbd-md",
    "kbd-sm",
    "kbd-xs",

    "table",
    "table-zebra",
    "table-normal",
    "table-compact",

    "mask",
    "mask-squircle",
    "mask-heart",
    "mask-hexagon",
    "mask-hexagon-2",
    "mask-decagon",
    "mask-pentagon",
    "mask-diamond",
    "mask-square",
    "mask-circle",
    "mask-parallelogram",
    "mask-parallelogram-2",
    "mask-parallelogram-3",
    "mask-parallelogram-4",
    "mask-star",
    "mask-star-2",
    "mask-triangle",
    "mask-triangle-2",
    "mask-triangle-3",
    "mask-triangle-4",

    "step",
    "steps",
    "steps-vertical",
    "steps-horizontal",
    "step-primary",
    "step-secondary",
    "step-accent",
    "step-info",
    "step-success",
    "step-warning",
    "step-error",

    "menu",
    "menu-title",
    "menu-normal",
    "menu-compact",
    "menu-vertical",
    "menu-horizontal",

    "border-spacing-0",
    "border-collapse",
    "border-separate",

    "rounded-none",
    "rounded-sm",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",

    "not-prose",
    "w-32",
    "m-0",
    "m-1",
    "mr-4",
    "ml-1",
    "ml-2",
  ],
  theme: {
    fontFamily: {
      sans: ["Ubuntu", "sans-serif"],
      mono: ["Ubuntu Mono", "monospace"],
    },
    cursor: {
      ["default"]: "default",
      ["pointer"]: "pointer",
      ["not-allowed"]: "not-allowed",
    },
    extend: {
      width: {
        window: "calc(100vw - 2rem - 2px)",
      },
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
