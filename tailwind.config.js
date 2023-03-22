module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    "!my-0.5",
    "!mt-0",

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

    /** MARKDOWN  */

    "checkbox",
    "checkbox-success",

    /** MARKDOWN  */

    "prose",
    "not-prose",

    "border-primary",
    "border-primary-focus",
    "border-primary-content",

    "border-secondary",
    "border-secondary-focus",
    "border-secondary-content",

    "border-accent",
    "border-accent-focus",
    "border-accent-content",

    "border-neutral",
    "border-neutral-focus",
    "border-neutral-content",

    "border-base-100",
    "border-base-200",
    "border-base-300",
    "border-base-content",

    "border-info",
    "border-info-content",

    "border-success",
    "border-success-content",

    "border-warning",
    "border-warning-content",

    "border-error",
    "border-error-content",

    "bg-primary",
    "bg-primary-focus",
    "bg-primary-content",

    "bg-secondary",
    "bg-secondary-focus",
    "bg-secondary-content",

    "bg-accent",
    "bg-accent-focus",
    "bg-accent-content",

    "bg-neutral",
    "bg-neutral-focus",
    "bg-neutral-content",

    "bg-base-100",
    "bg-base-200",
    "bg-base-300",
    "bg-base-content",

    "bg-info",
    "bg-info-content",

    "bg-success",
    "bg-success-content",

    "bg-warning",
    "bg-warning-content",

    "bg-error",
    "bg-error-content",

    "text-primary",
    "text-primary-focus",
    "text-primary-content",

    "text-secondary",
    "text-secondary-focus",
    "text-secondary-content",

    "text-accent",
    "text-accent-focus",
    "text-accent-content",

    "text-neutral",
    "text-neutral-focus",
    "text-neutral-content",

    "text-base-100",
    "text-base-200",
    "text-base-300",
    "text-base-content",

    "text-info",
    "text-info-content",

    "text-success",
    "text-success-content",

    "text-warning",
    "text-warning-content",

    "text-error",
    "text-error-content",

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

    "steps",
    "steps-vertical",
    "steps-horizontal",

    "step",
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

    "border",
    "border-l",
    "border-t",
    "border-r",
    "border-b",
    "border-x",
    "border-y",

    "border-solid",
    "border-dashed",
    "border-dotted",
    "border-double",
    "border-hidden",
    "border-none",

    "rounded-none",
    "rounded-sm",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",

    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-inner",
    "shadow-none",

    {
      pattern: /(w|h)-(10|12|16|24|32|64|1\/6|2\/6|3\/6|4\/6|5\/6|full)/,
    },
    {
      pattern: /border-(l|t|r|b|x|y)-(0|2|4|8)/,
    },
    {
      pattern: /(m|p)(l|t|r|b|x|y)?-(0|px|auto|1|2|3|4)/,
    },
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
      borderRadius: {
        btn: "var(--rounded-btn)",
      },
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
