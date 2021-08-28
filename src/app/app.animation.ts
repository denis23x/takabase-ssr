/** @format */

import { animate, query, state, style, transition, trigger } from '@angular/animations';

export const fadeRouting = trigger('fadeRouting', [
  transition('* <=> *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0
        })
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        animate(
          '300ms ease',
          style({
            opacity: 1
          })
        )
      ],
      { optional: true }
    )
  ])
]);

export const fade = trigger('fade', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  transition('void <=> *', animate('{{duration}}s {{delay}}s ease-in-out'), {
    params: {
      duration: 0.2,
      delay: 0
    }
  })
]);
