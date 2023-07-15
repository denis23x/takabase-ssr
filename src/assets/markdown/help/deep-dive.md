### Deep dive

Our layout is also highly customizable, allowing users to tailor it to their specific needs and preferences. This makes it easy to add and remove elements as needed, change color schemes, and adjust layouts to better suit the content and audience.

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
- [Active](){.not-prose .active}
- [Item 3](){.not-prose}
{.menu .menu-horizontal .shadow-xl .not-prose .overflow-auto .flex-nowrap .rounded-box .border .border-base-content/20 .p-0}
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
{.table .table-sm .not-prose .border .border-base-content/20 .rounded-md .border-spacing-0 .border-separate .overflow-hidden .my-0}
+++

[image]: https://placehold.co/120x120
