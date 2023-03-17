# Deep dive

You can use advanced layout provided by [DaisyUI](https://daisyui.com/) take a look there for documentation

Our layout is also highly customizable, allowing users to tailor it to their specific needs and preferences. This makes it easy to add and remove elements as needed, change color schemes, and adjust layouts to better suit the content and audience.

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

[Also you available to use size classes such as `btn-lg, btn-md, btn-sm, btn-xs`]{.ml-2 .block}
+++

+++ Badges are used to inform the user of the status of specific data.
[Primary]{.badge .badge-primary .m-1} [Secondary]{.badge .badge-secondary .m-1} [Accent]{.badge .badge-accent .m-1} [Info]{.badge .badge-info .m-1} [Success]{.badge .badge-success .m-1} [Warning]{.badge .badge-warning .m-1} [Error]{.badge .badge-error .m-1}
[Primary]{.badge .badge-primary .badge-outline .m-1} [Secondary]{.badge .badge-secondary .badge-outline .m-1} [Accent]{.badge .badge-accent .badge-outline .m-1} [Info]{.badge .badge-info .badge-outline .m-1} [Success]{.badge .badge-success .badge-outline .m-1} [Warning]{.badge .badge-warning .badge-outline .m-1} [Error]{.badge .badge-error .badge-outline .m-1}

[Also you available to use size classes such as `badge-lg, badge-md, badge-sm, badge-xs`]{.ml-2 .block}
+++

+++ Link adds the missing underline style to links.
[Primary]{.link .link-primary .m-1} [Secondary]{.link .link-secondary .m-1} [Accent]{.link .link-accent .m-1} [Info]{.link .link-info .m-1} [Success]{.link .link-success .m-1} [Warning]{.link .link-warning .m-1} [Error]{.link .link-error .m-1}
+++

+++ Mask crops the content of the element to common shapes.
To change image sizes you can use `width, height` attributes

| --- | --- | --- | --- | --- | --- |
| ![Chair](/assets/ikea-chair.png){.mask .mask-squircle} | ![Chair](/assets/ikea-chair.png){.mask .mask-heart} | ![Chair](/assets/ikea-chair.png){.mask .mask-hexagon} | ![Chair](/assets/ikea-chair.png){.mask .mask-hexagon-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-decagon} | ![Chair](/assets/ikea-chair.png){.mask .mask-pentagon} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-diamond} | ![Chair](/assets/ikea-chair.png){.mask .mask-square} | ![Chair](/assets/ikea-chair.png){.mask .mask-circle} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-3} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-4} | ![Chair](/assets/ikea-chair.png){.mask .mask-star} | ![Chair](/assets/ikea-chair.png){.mask .mask-star-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-3} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-4} |  |  |  |  |  |
{.border-separate}
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

You can combine steps with many colors like `step-primary, step-secondary, step-accent, step-info, step-success, step-warning, step-error`
+++

+++ Menu is used to display a list of links vertically or horizontally.
Vertical menu

- [Item 1](){.not-prose}
- [Item 2](){.not-prose}
- [Item 3](){.not-prose}
  {.menu .menu-vertical .shadow-xl .not-prose .rounded-box .border .border-base-content/20 .p-0 .m-0 .w-32}

Horizontal menu with active item

- [Item 1](){.not-prose}
- [Item 2](){.not-prose .active}
- [Item 3](){.not-prose}
- [Item 4](){.not-prose}
- [Item 5](){.not-prose}
- [Item 6](){.not-prose}
{.menu .menu-horizontal .shadow-xl .not-prose .rounded-box .border .border-base-content/20 .p-0}
+++

+++ Table can be used to show a list of data in a table format.
Zebra table

|     | NAME | JOB | FAVORITE COLOR | COMPANY | LOCATION
| --- | --- | --- | ---
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue | Littel, Schaden and Vandervort | Canada
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple | Zemlak, Daniel and Leannon | United States
| [3]{.font-bold} | Brice Swyre | Tax Accountant | Red | Carroll Group | China
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow | Sauer LLC | Indonesia
{.table .table-zebra .not-prose .border .border-base-content/20 .rounded-lg .border-spacing-0 .border-separate .overflow-hidden}

Compact table

|     | NAME | JOB | FAVORITE COLOR | COMPANY | LOCATION
| --- | --- | --- | ---
| [1]{.font-bold} | Cy Ganderton | Quality Control Specialist | Blue | Littel, Schaden and Vandervort | Canada
| [2]{.font-bold} | Hart Hagerty | Desktop Support Technician | Purple | Zemlak, Daniel and Leannon | United States
| [3]{.font-bold} | Brice Swyre | Tax Accountant | Red | Carroll Group | China
| [4]{.font-bold} | Irma Vasilik | Quality Control Specialist | Yellow | Sauer LLC | Indonesia
{.table .table-compact .not-prose .border .border-base-content/20 .rounded-md .border-spacing-0 .border-separate .overflow-hidden}
+++

+++ Utilities for controlling how flex items both grow and shrink.
` flex `
` items-center `
` justify-center `
+++
