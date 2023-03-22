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
Extra button size classes `btn-lg, btn-md, btn-sm, btn-xs`{.inline} {.alert .inline}

[Primary]{.btn .btn-primary .m-2} [Secondary]{.btn .btn-secondary .m-2} [Accent]{.btn .btn-accent .m-2} [Info]{.btn .btn-info .m-2} [Success]{.btn .btn-success .m-2} [Warning]{.btn .btn-warning .m-2} [Error]{.btn .btn-error .m-2} [Ghost]{.btn .btn-ghost .m-2}
[Primary]{.btn .btn-primary .btn-outline .m-2} [Secondary]{.btn .btn-secondary .btn-outline .m-2} [Accent]{.btn .btn-accent .btn-outline .m-2} [Info]{.btn .btn-info .btn-outline .m-2} [Success]{.btn .btn-success .btn-outline .m-2} [Warning]{.btn .btn-warning .btn-outline .m-2} [Error]{.btn .btn-error .btn-outline .m-2} [Ghost]{.btn .btn-ghost .btn-outline .m-2}
+++

+++ Badges are used to inform the user of the status of specific data.
Extra badge size classes `badge-lg, badge-md, badge-sm, badge-xs`{.inline} {.alert .inline}

[Primary]{.badge .badge-primary .m-2} [Secondary]{.badge .badge-secondary .m-2} [Accent]{.badge .badge-accent .m-2} [Info]{.badge .badge-info .m-2} [Success]{.badge .badge-success .m-2} [Warning]{.badge .badge-warning .m-2} [Error]{.badge .badge-error .m-2}
[Primary]{.badge .badge-primary .badge-outline .m-2} [Secondary]{.badge .badge-secondary .badge-outline .m-2} [Accent]{.badge .badge-accent .badge-outline .m-2} [Info]{.badge .badge-info .badge-outline .m-2} [Success]{.badge .badge-success .badge-outline .m-2} [Warning]{.badge .badge-warning .badge-outline .m-2} [Error]{.badge .badge-error .badge-outline .m-2}
+++

+++ Link adds the missing underline style to links.
Difference between [prose link](#){.inline} and [not-prose link](#){.inline .not-prose} {.alert .inline}

[Primary]{.link .link-primary .m-2} [Secondary]{.link .link-secondary .m-2} [Accent]{.link .link-accent .m-2} [Info]{.link .link-info .m-2} [Success]{.link .link-success .m-2} [Warning]{.link .link-warning .m-2} [Error]{.link .link-error .m-2}
+++

+++ Mask crops the content of the element to common shapes.
To change image size you can use `width, height`{.inline} attributes{.alert .inline}

| ------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![Placeholder][image]{.mask .mask-squircle width=120 height=120}         | ![Placeholder][image]{.mask .mask-heart width=120 height=120}  | ![Placeholder][image]{.mask .mask-hexagon width=120 height=120} | ![Placeholder][image]{.mask .mask-hexagon-2 width=120 height=120}     | ![Placeholder][image]{.mask .mask-decagon width=120 height=120}         | ![Placeholder][image]{.mask .mask-pentagon width=120 height=120}        |
| ![Placeholder][image]{.mask .mask-diamond  width=120 height=120}         | ![Placeholder][image]{.mask .mask-square width=120 height=120} | ![Placeholder][image]{.mask .mask-circle width=120 height=120}  | ![Placeholder][image]{.mask .mask-parallelogram width=120 height=120} | ![Placeholder][image]{.mask .mask-parallelogram-2 width=120 height=120} | ![Placeholder][image]{.mask .mask-parallelogram-3 width=120 height=120} |
| ![Placeholder][image]{.mask .mask-parallelogram-4  width=120 height=120} | ![Placeholder][image]{.mask .mask-star width=120 height=120}   | ![Placeholder][image]{.mask .mask-star-2 width=120 height=120}  | ![Placeholder][image]{.mask .mask-triangle width=120 height=120}      | ![Placeholder][image]{.mask .mask-triangle-2 width=120 height=120}      | ![Placeholder][image]{.mask .mask-triangle-3 width=120 height=120}      |
| ![Placeholder][image]{.mask .mask-triangle-4  width=120 height=120}      |                                                                |                                                                 |                                                                       |                                                                         |                                                                         |
{.border-separate .table .my-0 .not-prose style=width:928px;}
+++

+++ Steps can be used to show a list of steps in a process.
Extra step colors `step-primary, step-secondary, step-accent, step-info, step-success, step-warning, step-error`{.inline} {.alert .inline}

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
- Step {.step .step-info}
- Step {.step}
- Step {.step}
- Step {.step}
{.steps .steps-horizontal .not-prose .p-0 .m-0}
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
- [Item 7](){.not-prose}
- [Item 8](){.not-prose}
- [Item 9](){.not-prose}
{.menu .menu-horizontal .shadow-xl .not-prose .overflow-auto .flex-nowrap .rounded-box .border .border-base-content/20 .p-0 .w-8/12}
+++

+++ Table can be used to show a list of data in a table format.
Zebra table

|                 | NAME         | JOB                        | FAVORITE COLOR | COMPANY                        | LOCATION      |
| --------------- | ------------ | -------------------------- | -------------- | ------------------------------ | ------------- |
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue           | Littel, Schaden and Vandervort | Canada        |
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple         | Zemlak, Daniel and Leannon     | United States |
| [3]{.font-bold} | Brice Swyre  | Tax Accountant             | Red            | Carroll Group                  | China         |
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow         | Sauer LLC                      | Indonesia     |
{.table .table-zebra .not-prose .border .border-base-content/20 .rounded-lg .border-spacing-0 .border-separate .overflow-hidden .my-0}

Compact table

|                 | NAME         | JOB                        | FAVORITE COLOR | COMPANY                        | LOCATION      |
| --------------- | ------------ | -------------------------- | -------------- | ------------------------------ | ------------- |
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue           | Littel, Schaden and Vandervort | Canada        |
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple         | Zemlak, Daniel and Leannon     | United States |
| [3]{.font-bold} | Brice Swyre  | Tax Accountant             | Red            | Carroll Group                  | China         |
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow         | Sauer LLC                      | Indonesia     |
{.table .table-compact .not-prose .border .border-base-content/20 .rounded-md .border-spacing-0 .border-separate .overflow-hidden .my-0}
+++

App bundle comes with a wide range of CSS classes that you can use to style your layout in any way you want. Additionally, we provide a comprehensive safe list of classes that you can use with confidence, ensuring that your layout looks great and functions perfectly.

You can read much more information about classes and advanced layout in [DaisyUI](https://daisyui.com/) and [Tailwind](https://tailwindcss.com/) documentation, take a look there to write effective materials.

+++ Safe classes what you be able to use
``` scss
// Prose (turn on/off all default styles)

prose
not-prose

// Background color

bg-primary
bg-primary-focus
bg-primary-content

bg-secondary
bg-secondary-focus
bg-secondary-content

bg-accent
bg-accent-focus
bg-accent-content

bg-neutral
bg-neutral-focus
bg-neutral-content

bg-base-100
bg-base-200
bg-base-300
bg-base-content

bg-info
bg-info-content

bg-success
bg-success-content

bg-warning
bg-warning-content

bg-error
bg-error-content

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

// Table border

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

// Border width

border
border-0
border-2
border-4
border-8

border-l
border-l-0
border-l-2
border-l-4
border-l-8

border-t
border-t-0
border-t-2
border-t-4
border-t-8

border-r
border-r-0
border-r-2
border-r-4
border-r-8

border-b
border-b-0
border-b-2
border-b-4
border-b-8

border-x
border-x-0
border-x-2
border-x-4
border-x-8

border-y
border-y-0
border-y-2
border-y-4
border-y-8

// Border color

border-primary
border-primary-focus
border-primary-content

border-secondary
border-secondary-focus
border-secondary-content

border-accent
border-accent-focus
border-accent-content

border-neutral
border-neutral-focus
border-neutral-content

border-base-100
border-base-200
border-base-300
border-base-content

border-info
border-info-content

border-success
border-success-content

border-warning
border-warning-content

border-error
border-error-content

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
    
// Text color

text-primary
text-primary-focus
text-primary-content

text-secondary
text-secondary-focus
text-secondary-content

text-accent
text-accent-focus
text-accent-content

text-neutral
text-neutral-focus
text-neutral-content

text-base-100
text-base-200
text-base-300
text-base-content

text-info
text-info-content

text-success
text-success-content

text-warning
text-warning-content

text-error
text-error-content

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

// Margin

m-0
m-2
m-4
m-8
m-16
m-32
m-auto

ml-0
ml-2
ml-4
ml-8
ml-16
ml-32
ml-auto

mt-0
mt-2
mt-4
mt-8
mt-16
mt-32
mt-auto

mr-0
mr-2
mr-4
mr-8
mr-16
mr-32
mr-auto

mb-0
mb-2
mb-4
mb-8
mb-16
mb-32
mb-auto

mx-0
mx-2
mx-4
mx-8
mx-16
mx-32
mx-auto

my-0
my-2
my-4
my-8
my-16
my-32
my-auto

// Padding

p-0
p-2
p-4
p-8
p-16
p-32

pl-0
pl-2
pl-4
pl-8
pl-16
pl-32

pt-0
pt-2
pt-4
pt-8
pt-16
pt-32

pr-0
pr-2
pr-4
pr-8
pr-16
pr-32

pb-0
pb-2
pb-4
pb-8
pb-16
pb-32

px-0
px-2
px-4
px-8
px-16
px-32

py-0
py-2
py-4
py-8
py-16
py-32

// Width
 
w-8
w-16
w-24
w-32
w-64
w-1/12
w-2/12
w-3/12
w-4/12
w-5/12
w-6/12
w-7/12
w-8/12
w-9/12
w-10/12
w-11/12
w-full
w-auto

// Height

h-8
h-16
h-24
h-32
h-64
h-full
h-auto

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
