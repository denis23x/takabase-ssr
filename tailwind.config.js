module.exports = {
  mode: "jit",
  content: ["./src/**/*.html"],
  safelist: [
    /** IMPORTANT BY SOME CASE  */

    "!m-0",
    "!bg-transparent",

    /** ANIMATIONS  */

    "animate-pulse",
    "inset-0",

    /** PROGRESS  */

    "progress",
    "progress-info",
    "progress-success",
    "progress-error",
    "progress-warning",

    /** WINDOW  */

    "max-h-[calc(100dvh-2rem)]",
    "max-w-[calc(100vw-2rem)]",
    "md:max-h-[80dvh]",
    "md:max-w-[calc(768px-4rem)]",

    /** MARKDOWN  */

    "checkbox",
    "checkbox-success",

    /** MARKDOWN SAFE LIST  */

    // Prose

    "prose",
    "not-prose",

    // Background colors

    "bg-primary",
    "bg-primary-content",
    "bg-secondary",
    "bg-secondary-content",
    "bg-accent",
    "bg-accent-content",
    "bg-neutral",
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

    // Text colors

    "text-primary",
    "text-primary-content",
    "text-secondary",
    "text-secondary-content",
    "text-accent",
    "text-accent-content",
    "text-neutral",
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

    // Text size

    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",

    // Text decoration

    "underline",
    "overline",
    "line-through",
    "no-underline",
    "italic",
    "not-italic",

    // Font weight

    "font-thin",
    "font-extralight",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
    "font-black",

    // Floats

    "float-start",
    "float-end",
    "float-right",
    "float-left",
    "float-none",

    // Alert

    "alert",
    "alert-info",
    "alert-success",
    "alert-warning",
    "alert-error",

    // Link

    "link",
    "link-neutral",
    "link-primary",
    "link-secondary",
    "link-accent",
    "link-info",
    "link-success",
    "link-warning",
    "link-error",

    // Button

    "btn",
    "btn-neutral",
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

    // Divider

    "divider",
    "divider-neutral",
    "divider-primary",
    "divider-secondary",
    "divider-accent",
    "divider-success",
    "divider-warning",
    "divider-info",
    "divider-error",
    "divider-vertical",
    "divider-horizontal",
    "divider-start",
    "divider-end",

    // Badge

    "badge",
    "badge-neutral",
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

    // Spoiler

    "collapse",
    "collapse-arrow",
    "collapse-title",
    "collapse-content",

    // Keyboard

    "kbd",
    "kbd-lg",
    "kbd-md",
    "kbd-sm",
    "kbd-xs",

    // Table

    "table",
    "table-zebra",
    "table-xs",
    "table-sm",
    "table-md",
    "table-lg",

    // Table border

    "border-spacing-0",
    "border-collapse",
    "border-separate",

    // Image mask

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

    // Step

    "steps",
    "steps-vertical",
    "steps-horizontal",

    // Step item

    "step",
    "step-primary",
    "step-secondary",
    "step-accent",
    "step-info",
    "step-success",
    "step-warning",
    "step-error",

    // Menu

    "menu",
    "menu-title",
    "menu-normal",
    "menu-compact",
    "menu-vertical",
    "menu-horizontal",

    // Border

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

    // Border color

    "border-primary",
    "border-primary-content",
    "border-secondary",
    "border-secondary-content",
    "border-accent",
    "border-accent-content",
    "border-neutral",
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

    "border-l-primary",
    "border-l-primary-content",
    "border-l-secondary",
    "border-l-secondary-content",
    "border-l-accent",
    "border-l-accent-content",
    "border-l-neutral",
    "border-l-neutral-content",
    "border-l-base-100",
    "border-l-base-200",
    "border-l-base-300",
    "border-l-base-content",
    "border-l-info",
    "border-l-info-content",
    "border-l-success",
    "border-l-success-content",
    "border-l-warning",
    "border-l-warning-content",
    "border-l-error",
    "border-l-error-content",

    "border-t-primary",
    "border-t-primary-content",
    "border-t-secondary",
    "border-t-secondary-content",
    "border-t-accent",
    "border-t-accent-content",
    "border-t-neutral",
    "border-t-neutral-content",
    "border-t-base-100",
    "border-t-base-200",
    "border-t-base-300",
    "border-t-base-content",
    "border-t-info",
    "border-t-info-content",
    "border-t-success",
    "border-t-success-content",
    "border-t-warning",
    "border-t-warning-content",
    "border-t-error",
    "border-t-error-content",

    "border-r-primary",
    "border-r-primary-content",
    "border-r-secondary",
    "border-r-secondary-content",
    "border-r-accent",
    "border-r-accent-content",
    "border-r-neutral",
    "border-r-neutral-content",
    "border-r-base-100",
    "border-r-base-200",
    "border-r-base-300",
    "border-r-base-content",
    "border-r-info",
    "border-r-info-content",
    "border-r-success",
    "border-r-success-content",
    "border-r-warning",
    "border-r-warning-content",
    "border-r-error",
    "border-r-error-content",

    "border-b-primary",
    "border-b-primary-content",
    "border-b-secondary",
    "border-b-secondary-content",
    "border-b-accent",
    "border-b-accent-content",
    "border-b-neutral",
    "border-b-neutral-content",
    "border-b-base-100",
    "border-b-base-200",
    "border-b-base-300",
    "border-b-base-content",
    "border-b-info",
    "border-b-info-content",
    "border-b-success",
    "border-b-success-content",
    "border-b-warning",
    "border-b-warning-content",
    "border-b-error",
    "border-b-error-content",

    // Border style

    "border-solid",
    "border-dashed",
    "border-dotted",
    "border-double",
    "border-hidden",
    "border-none",

    // Border radius

    "rounded-none",
    "rounded-sm",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",

    // Aspect ratio

    "aspect-auto",
    "aspect-square",
    "aspect-video",

    // Object fit

    "object-contain",
    "object-cover",
    "object-fill",
    "object-none",
    "object-scale-down",

    // Shadow

    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-inner",
    "shadow-none",

    // Margin (outer space)

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

    // Padding (inner space)

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

    // Width

    "w-8",
    "w-16",
    "w-24",
    "w-32",
    "w-64",
    "w-full",
    "w-auto",

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

    // Height

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
      roboto: ["Roboto", "sans-serif"],
    },
    extend: {
      gridTemplateColumns: {
        alert: "1.5rem minmax(0, auto)",
      },
      borderRadius: {
        btn: "var(--rounded-btn)",
      },
      maxHeight: {
        58: "14.5rem",
        76: "19rem",
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
        ["pwa"]: {
          raw: "(display-mode: standalone)"
        },
      },
    },
  },
  daisyui: {
    themes: true,
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
}
