/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import UAParser from 'ua-parser-js';

@Pipe({
  name: 'ua'
})
export class UaPipe implements PipeTransform {
  constructor() {}

  transform(value: string): UAParser.IResult {
    const uaParser: UAParser = new UAParser(value);

    return uaParser.getResult();
  }
}
