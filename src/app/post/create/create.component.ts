/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MarkdownService } from '../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HelperService, PlatformService } from '../../core';
import { DOCUMENT } from '@angular/common';
import Split from 'split-grid';

@Component({
  selector: 'app-posts-create',
  templateUrl: './create.component.html'
})
export class PostsCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  postForm: FormGroup;
  postForm$: Subscription;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private markdownService: MarkdownService,
    private fb: FormBuilder,
    private platformService: PlatformService,
    private helperService: HelperService
  ) {
    this.postForm = this.fb.group({
      // body: [
      //   '',
      //   [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]
      // ]
      body: [
        '# Lorem ipsum dolor \n' +
          '\n' +
          '@[Github](https://gist.github.com/denis23x/17a3ad54888c43a8c51d71af1dcc620f)\n' +
          '\n' +
          '\n' +
          '- List\n' +
          '- asd\n' +
          '- dfg\n' +
          '\n' +
          '\n' +
          '1. Ordered List \n' +
          '1. Ordered List \n' +
          '1. Ordered List \n' +
          '\n' +
          '\n' +
          '@[Github](https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc)\n' +
          '\n' +
          '```typescript\n' +
          '  isMobile(): boolean {\n' +
          '    if (this.isBrowser()) {\n' +
          '      return (agent => {\n' +
          '        const a = /(android|bb\\d+|meego).+mobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;\n' +
          '        const b = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-/i;\n' +
          '\n' +
          '        return a.test(agent) || b.test(agent.substr(0, 4));\n' +
          "      })(navigator.userAgent || navigator.vendor || window['opera']);\n" +
          '    }\n' +
          '\n' +
          '    return false;\n' +
          '  }\n' +
          '```' +
          '\n' +
          '## sit amet, \n' +
          '\n' +
          '### consectetur adipiscing elit.\n' +
          '\n' +
          'Donec ac hendrerit ligula. Fusce mollis **vitae** risus ut ~~consectetur~~. Nunc ultricies purus varius turpis fermentum, sed facilisis eros lacinia. Sed ac eros maximus, aliquam nisl vitae, molestie tortor. Fusce ut massa ornare, posuere diam interdum, suscipit risus. Phasellus varius nisi \n' +
          '\n' +
          '## enim\n' +
          '\n' +
          'sed interdum velit molestie ac. Sed eleifend venenatis purus, at dignissim lorem volutpat et. Curabitur dui turpis, efficitur vitae luctus eget, hendrerit a neque. Aenean feugiat rutrum tellus, ac \n' +
          '\n' +
          '### faucibus augue dapibus in. Aenean semper semper semper.\n' +
          '\n' +
          'https://habr.com/ru/post/547868/\n' +
          'https://habr.com/ru/post/547868/\n' +
          '\n' +
          '![https://miro.medium.com/max/1838/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg](https://miro.medium.com/max/1838/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg)\n' +
          '\n' +
          '@[Youtube](https://www.youtube.com/watch?v=AYT43y-O2TM&ab_channel=%D0%93%D0%BB%D0%B0%D0%B4%D0%92%D0%B0%D0%BB%D0%B0%D0%BA%D0%B0%D1%81)\n' +
          '\n' +
          'https://miro.medium.com/max/1838/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg\n' +
          '\n' +
          'https://habr.com/ru/post/547868/ Mauris ut tellus nec ipsum tristique volutpat. Pellentesque turpis elit, faucibus a sem sit amet, consectetur dapibus mauris. Ut et nunc ac risus tempus varius non eu sapien. Aliquam semper imperdiet ornare. Curabitur ante mauris, posuere eget pretium at, tincidunt non justo. Phasellus tincidunt convallis varius. Suspendisse tristique scelerisque odio non congue. Ut at massa vel nisi tempor faucibus euismod vel nisi. Aliquam eget ornare ante, quis luctus justo. Curabitur in rutrum felis, sit amet tristique arcu. Suspendisse vulputate sem turpis, nec commodo urna consectetur vitae. Quisque eu varius massa. Nullam aliquet sodales lacus sed pulvinar. Praesent at risus eget purus dictum placerat.\n',
        [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]
      ]
    });
  }

  ngOnInit(): void {
    this.postForm$ = this.postForm
      .get('body')
      .valueChanges.pipe(debounceTime(400))
      .subscribe(body => {
        // console.log('subscribe', body);
      });
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      Split({
        minSize: this.editorMinSize,
        columnGutters: [
          {
            track: 1,
            element: this.gutter.nativeElement
          }
        ]
      });
    }
  }

  ngOnDestroy(): void {
    [this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      console.log('onSubmitForm', this.postForm.value);
    }
  }
}
