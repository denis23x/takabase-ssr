# Deep dive

Our layout is also highly customizable, allowing users to tailor it to their specific needs and preferences. This makes it easy to add and remove elements as needed, change color schemes, and adjust layouts to better suit the content and audience. {.alert}

+++ Alert informs users about important events.
[12 unread messages. Tap to see.]{.alert}
[New software update available.]{.alert .alert-info}
[Your purchase has been confirmed!]{.alert .alert-success}
[Warning: Invalid email address!]{.alert .alert-warning}
[Error! Task failed successfully.]{.alert .alert-error}
+++

+++ Buttons allow the user to take actions or make choices.
[Primary]{.btn .btn-primary .m-1} [Secondary]{.btn .btn-secondary .m-1} [Accent]{.btn .btn-accent .m-1} [Info]{.btn .btn-info .m-1} [Success]{.btn .btn-success .m-1} [Warning]{.btn .btn-warning .m-1} [Error]{.btn .btn-error .m-1} [Ghost]{.btn .btn-ghost .m-1} [Link]{.btn .btn-link .m-1}
[Primary]{.btn .btn-primary .btn-outline .m-1} [Secondary]{.btn .btn-secondary .btn-outline .m-1} [Accent]{.btn .btn-accent .btn-outline .m-1} [Info]{.btn .btn-info .btn-outline .m-1} [Success]{.btn .btn-success .btn-outline .m-1} [Warning]{.btn .btn-warning .btn-outline .m-1} [Error]{.btn .btn-error .btn-outline .m-1} [Ghost]{.btn .btn-ghost .btn-outline .m-1} [Link]{.btn .btn-link .btn-outline .m-1}

[Extra button size classes `btn-lg, btn-md, btn-sm, btn-xs`]{.ml-2 .block}
+++

+++ Badges are used to inform the user of the status of specific data.
[Primary]{.badge .badge-primary .m-1} [Secondary]{.badge .badge-secondary .m-1} [Accent]{.badge .badge-accent .m-1} [Info]{.badge .badge-info .m-1} [Success]{.badge .badge-success .m-1} [Warning]{.badge .badge-warning .m-1} [Error]{.badge .badge-error .m-1}
[Primary]{.badge .badge-primary .badge-outline .m-1} [Secondary]{.badge .badge-secondary .badge-outline .m-1} [Accent]{.badge .badge-accent .badge-outline .m-1} [Info]{.badge .badge-info .badge-outline .m-1} [Success]{.badge .badge-success .badge-outline .m-1} [Warning]{.badge .badge-warning .badge-outline .m-1} [Error]{.badge .badge-error .badge-outline .m-1}

[Extra badge size classes `badge-lg, badge-md, badge-sm, badge-xs`]{.ml-2 .block}
+++

+++ Link adds the missing underline style to links.
[Primary]{.link .link-primary .m-1} [Secondary]{.link .link-secondary .m-1} [Accent]{.link .link-accent .m-1} [Info]{.link .link-info .m-1} [Success]{.link .link-success .m-1} [Warning]{.link .link-warning .m-1} [Error]{.link .link-error .m-1}

Difference between `.prose` [link](#) and `.not-prose` [link](#){.not-prose}
+++

+++ Mask crops the content of the element to common shapes.
To change image size you can use `width, height` attributes

| -------------------------------------------- | ----------------------------------- | ------------------------------------ | ------------------------------------------ | -------------------------------------------- | -------------------------------------------- |
| ![Chair][image]{.mask .mask-squircle}        | ![Chair][image]{.mask .mask-heart}  | ![Chair][image]{.mask .mask-hexagon} | ![Chair][image]{.mask .mask-hexagon-2}     | ![Chair][image]{.mask .mask-decagon}         | ![Chair][image]{.mask .mask-pentagon}        |
| ![Chair][image]{.mask .mask-diamond}         | ![Chair][image]{.mask .mask-square} | ![Chair][image]{.mask .mask-circle}  | ![Chair][image]{.mask .mask-parallelogram} | ![Chair][image]{.mask .mask-parallelogram-2} | ![Chair][image]{.mask .mask-parallelogram-3} |
| ![Chair][image]{.mask .mask-parallelogram-4} | ![Chair][image]{.mask .mask-star}   | ![Chair][image]{.mask .mask-star-2}  | ![Chair][image]{.mask .mask-triangle}      | ![Chair][image]{.mask .mask-triangle-2}      | ![Chair][image]{.mask .mask-triangle-3}      |
| ![Chair][image]{.mask .mask-triangle-4}      |                                     |                                      |                                            |                                              |                                              |
{.border-separate .table}
+++

+++ Steps can be used to show a list of steps in a process.
Vertical steps

- Register{.step .step-primary}
- Choose plan{.step .step-primary}
- Purchase{.step}
- Receive Product{.step}
{.steps .steps-vertical .not-prose .p-0 .m-0}

Horizontal steps

- Step {.step}
- Step {.step .step-warning}
- Step {.step .step-warning}
- Step {.step .step-info}
- Step {.step .step-info}
- Step {.step}
{.steps .steps-horizontal .not-prose .p-0 .m-0}

Extra step colors `step-primary, step-secondary, step-accent, step-info, step-success, step-warning, step-error`
+++

+++ Menu is used to display a list of links vertically or horizontally.
Vertical menu

- [Item 1](){.not-prose}
- [Item 2](){.not-prose}
- [Item 3](){.not-prose}
  {.menu .menu-vertical .shadow-xl .not-prose .rounded-box .border .border-base-content/20 .p-0 .m-0 .w-32}

Horizontal menu with active item

- [Item 1](){.not-prose}
- [Item 2 active](){.not-prose .active}
- [Item 3](){.not-prose}
- [Item 4](){.not-prose}
- [Item 5](){.not-prose}
- [Item 6](){.not-prose}
{.menu .menu-horizontal .shadow-xl .not-prose .rounded-box .border .border-base-content/20 .p-0}
+++

+++ Table can be used to show a list of data in a table format.
Zebra table

|                 | NAME         | JOB                        | FAVORITE COLOR | COMPANY                        | LOCATION      |
| --------------- | ------------ | -------------------------- | -------------- | ------------------------------ | ------------- |
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue           | Littel, Schaden and Vandervort | Canada        |
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple         | Zemlak, Daniel and Leannon     | United States |
| [3]{.font-bold} | Brice Swyre  | Tax Accountant             | Red            | Carroll Group                  | China         |
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow         | Sauer LLC                      | Indonesia     |
{.table .table-zebra .not-prose .border .border-base-content/20 .rounded-lg .border-spacing-0 .border-separate .overflow-hidden}

Compact table

|                 | NAME         | JOB                        | FAVORITE COLOR | COMPANY                        | LOCATION      |
| --------------- | ------------ | -------------------------- | -------------- | ------------------------------ | ------------- |
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue           | Littel, Schaden and Vandervort | Canada        |
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple         | Zemlak, Daniel and Leannon     | United States |
| [3]{.font-bold} | Brice Swyre  | Tax Accountant             | Red            | Carroll Group                  | China         |
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow         | Sauer LLC                      | Indonesia     |
{.table .table-compact .not-prose .border .border-base-content/20 .rounded-md .border-spacing-0 .border-separate .overflow-hidden}
+++

App bundle comes with a wide range of CSS classes that you can use to style your layout in any way you want. Additionally, we provide a comprehensive safe list of classes that you can use with confidence, ensuring that your layout looks great and functions perfectly.

You can read much more information about classes and advanced layout in [DaisyUI](https://daisyui.com/) and [Tailwind](https://tailwindcss.com/) documentation, take a look there to write effective materials.

+++ Safe classes what you be able to use
``` scss
// Prose

/* Turn on/off all default classes */

prose
not-prose

// Colors

/* Don't forget to add prefix for your classes like (text|bg)-(color) */

primary
primary-focus
primary-content

secondary
secondary-focus
secondary-content

accent
accent-focus
accent-content

neutral
neutral-focus
neutral-content

base-100
base-200
base-300
base-content

info
info-content

success
success-content

warning
warning-content

error
error-content

// Alert 

alert
alert-info
alert-success
alert-warning
alert-error

// Link

link
link-neutral
link-primary
link-secondary
link-accent
link-info
link-success
link-warning
link-error

// Button

btn
btn-primary
btn-secondary
btn-accent
btn-info
btn-success
btn-warning
btn-error
btn-ghost
btn-link
btn-outline
btn-lg
btn-md
btn-sm
btn-xs

// Badge

badge
badge-primary
badge-secondary
badge-accent
badge-info
badge-success
badge-warning
badge-error
badge-ghost
badge-link
badge-outline
badge-lg
badge-md
badge-sm
badge-xs

// Keyboard

kbd
kbd-lg
kbd-md
kbd-sm
kbd-xs

// Table

table
table-zebra
table-normal
table-compact

// Table border utilities

border-spacing-0
border-collapse
border-separate

// Mask

mask
mask-squircle
mask-heart
mask-hexagon
mask-hexagon-2
mask-decagon
mask-pentagon
mask-diamond
mask-square
mask-circle
mask-parallelogram
mask-parallelogram-2
mask-parallelogram-3
mask-parallelogram-4
mask-star
mask-star-2
mask-triangle
mask-triangle-2
mask-triangle-3
mask-triangle-4

// Step

steps
steps-vertical
steps-horizontal

step
step-primary
step-secondary
step-accent
step-info
step-success
step-warning
step-error

// Menu

menu
menu-title
menu-normal
menu-compact
menu-vertical
menu-horizontal

// Border pattern

/* You can be able to write border in all four directions from 0px to 8px */

border-(l|t|r|b|x|y)-(0|2|4|8)

// Border color

/* Any of the colors listed above */

// Border style

border-solid
border-dashed
border-dotted
border-double
border-hidden
border-none

// Border radius

rounded-none
rounded-sm
rounded
rounded-md
rounded-lg
rounded-xl
    
// Text size
    
text-xs
text-sm
text-base
text-lg
text-xl
text-2xl
text-3xl
text-4xl
    
// Text decoration
    
underline
no-underline
italic
not-italic
overline
line-through

// Margin and padding pattern
 
/* You can be able to write spacing in all directions from 0 to 4 (where 4 === 16px) */

(m|p)(l|t|r|b|x|y)?-(0|px|0.5|1|1.5|2|2.5|3|3.5|4)

// Width and height pattern
 
/* You can be able to write size in X and Y directions from 10 to 32 (where 32 === 128px) */

(w|h)-(10|12|16|24|32|full)

// Shadow

shadow-sm
shadow
shadow-md
shadow-lg
shadow-xl
shadow-2xl
shadow-inner
shadow-none
```
+++

### Compatibility

Implementation of markdown includes a wide range of features beyond the standard markdown syntax. While default markdown is a great tool for simple formatting, we recognize that many of our users require more advanced functionality to fully express their ideas and creativity. That's why we've developed a custom markdown implementation that supports a range of features, including advanced tables, attributes, media, syntax highlighting, and more.

Use only [base syntax](https://www.markdownguide.org/basic-syntax/) to achieve 100% compatibility.

Using our connected plugins we can't guarantee your syntax will work well in third party editors.

+++ Connected Markdown plugins
- [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)
- [markdown-it-bracketed-spans](https://www.npmjs.com/package/markdown-it-bracketed-spans)
- [markdown-it-collapsible](https://www.npmjs.com/package/markdown-it-collapsible)
- [markdown-it-emoji](https://www.npmjs.com/package/markdown-it-emoji)
- [markdown-it-link-attributes](https://www.npmjs.com/package/markdown-it-link-attributes)
- [markdown-it-mark](https://www.npmjs.com/package/markdown-it-mark)
- [markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table)
- [markdown-it-smartarrows](https://www.npmjs.com/package/markdown-it-smartarrows)
- [markdown-it-tasks](https://www.npmjs.com/package/markdown-it-tasks)
- [markdown-it-video](https://www.npmjs.com/package/markdown-it-video)
+++

[image]: https://placehold.co/120x120
