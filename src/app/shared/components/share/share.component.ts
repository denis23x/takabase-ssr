/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Share } from '../../../core/models/share.model';
import { PlatformService, Post } from '../../../core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html'
})
export class ShareComponent implements OnInit, OnDestroy {
  activatedRoute$: Subscription;

  sharePath: string;
  shareList: Share[] = [
    {
      value: 'envelope',
      href: 'mailto:',
      label: 'Email',
      icon: 'envelope',
      color: '#4267B2'
    },
    {
      value: 'facebook',
      href: 'https://facebook.com/sharer/sharer.php',
      label: 'Facebook',
      icon: 'facebook',
      color: '#4267B2'
    },
    {
      value: 'linkedin',
      href: 'https://www.linkedin.com/shareArticle',
      label: 'Linkedin',
      icon: 'linkedin',
      color: '#0A66C2'
    },
    {
      value: 'pinterest',
      href: 'https://pinterest.com/pin/create/button/',
      label: 'Pinterest',
      icon: 'pinterest',
      color: '#E60023'
    },
    {
      value: 'reddit',
      href: 'https://reddit.com/submit/',
      label: 'Reddit',
      icon: 'reddit',
      color: '#FF4500'
    },
    {
      value: 'telegram',
      href: 'https://telegram.me/share/url',
      label: 'Telegram',
      icon: 'telegram',
      color: '#2AABEE'
    },
    {
      value: 'twitter',
      href: 'https://twitter.com/intent/tweet/',
      label: 'Twitter',
      icon: 'twitter',
      color: '#1DA1F2'
    },
    {
      value: 'whatsapp',
      href: 'whatsapp://send',
      label: 'Whatsapp',
      icon: 'whatsapp',
      color: '#25D366'
    }
  ];

  constructor(private platformService: PlatformService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute$ = this.activatedRoute.data.pipe(pluck('data')).subscribe((post: Post) => {
      if (this.platformService.isBrowser()) {
        const window: Window = this.platformService.getWindow();

        this.sharePath = window.location.href;

        // prettier-ignore
        this.shareList.forEach((share: Share) => (share.href = [share.href, this.getShareHref(share, post)].join('?')));
      }
    });
  }

  ngOnDestroy(): void {
    [this.activatedRoute$].forEach($ => $?.unsubscribe());
  }

  getShareHref(share: Share, post: Post): string {
    /** https://sharingbuttons.io/ */
    /** https://www.freeformatter.com/url-parser-query-string-splitter.html */

    switch (share.value) {
      case 'envelope': {
        return this.getEncodedURI({
          subject: post.title,
          body: this.sharePath
        });
      }
      case 'facebook': {
        return this.getEncodedURI({
          t: post.title,
          u: this.sharePath
        });
      }
      case 'linkedin': {
        return this.getEncodedURI({
          mini: true,
          url: this.sharePath,
          title: post.title,
          summary: post.body,
          source: this.sharePath
        });
      }
      case 'pinterest': {
        return this.getEncodedURI({
          url: this.sharePath,
          media: this.sharePath,
          description: post.title
        });
      }
      case 'reddit': {
        return this.getEncodedURI({
          url: this.sharePath,
          resubmit: true,
          title: post.title
        });
      }
      case 'telegram': {
        return this.getEncodedURI({
          url: this.sharePath,
          text: post.title
        });
      }
      case 'twitter': {
        return this.getEncodedURI({
          url: this.sharePath,
          text: post.title
        });
      }
      case 'whatsapp': {
        return this.getEncodedURI({
          text: post.title
        });
      }
      default: {
        return share.href;
      }
    }
  }

  getEncodedURI(data: any): string {
    return Object.keys(data)
      .map((key: string) => [key, data[key]].map(encodeURIComponent).join('='))
      .join('&');
  }
}
