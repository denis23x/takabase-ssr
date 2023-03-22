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

    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",

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

    "border",
    "border-0",
    "border-2",
    "border-4",
    "border-8",

    "border-l",
    "border-l-0",
    "border-l-2",
    "border-l-4",
    "border-l-8",

    "border-t",
    "border-t-0",
    "border-t-2",
    "border-t-4",
    "border-t-8",

    "border-r",
    "border-r-0",
    "border-r-2",
    "border-r-4",
    "border-r-8",

    "border-b",
    "border-b-0",
    "border-b-2",
    "border-b-4",
    "border-b-8",

    "border-x",
    "border-x-0",
    "border-x-2",
    "border-x-4",
    "border-x-8",

    "border-y",
    "border-y-0",
    "border-y-2",
    "border-y-4",
    "border-y-8",

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

    "m-0",
    "m-2",
    "m-4",
    "m-8",
    "m-16",
    "m-32",
    "m-auto",

    "ml-0",
    "ml-2",
    "ml-4",
    "ml-8",
    "ml-16",
    "ml-32",
    "ml-auto",

    "mt-0",
    "mt-2",
    "mt-4",
    "mt-8",
    "mt-16",
    "mt-32",
    "mt-auto",

    "mr-0",
    "mr-2",
    "mr-4",
    "mr-8",
    "mr-16",
    "mr-32",
    "mr-auto",

    "mb-0",
    "mb-2",
    "mb-4",
    "mb-8",
    "mb-16",
    "mb-32",
    "mb-auto",

    "mx-0",
    "mx-2",
    "mx-4",
    "mx-8",
    "mx-16",
    "mx-32",
    "mx-auto",

    "my-0",
    "my-2",
    "my-4",
    "my-8",
    "my-16",
    "my-32",
    "my-auto",

    "p-0",
    "p-2",
    "p-4",
    "p-8",
    "p-16",
    "p-32",

    "pl-0",
    "pl-2",
    "pl-4",
    "pl-8",
    "pl-16",
    "pl-32",

    "pt-0",
    "pt-2",
    "pt-4",
    "pt-8",
    "pt-16",
    "pt-32",

    "pr-0",
    "pr-2",
    "pr-4",
    "pr-8",
    "pr-16",
    "pr-32",

    "pb-0",
    "pb-2",
    "pb-4",
    "pb-8",
    "pb-16",
    "pb-32",

    "px-0",
    "px-2",
    "px-4",
    "px-8",
    "px-16",
    "px-32",

    "py-0",
    "py-2",
    "py-4",
    "py-8",
    "py-16",
    "py-32",

    "w-8",
    "w-16",
    "w-24",
    "w-32",
    "w-64",
    "w-1/12",
    "w-2/12",
    "w-3/12",
    "w-4/12",
    "w-5/12",
    "w-6/12",
    "w-7/12",
    "w-8/12",
    "w-9/12",
    "w-10/12",
    "w-11/12",
    "w-full",
    "w-auto",

    "h-8",
    "h-16",
    "h-24",
    "h-32",
    "h-64",
    "h-full",
    "h-auto",
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
