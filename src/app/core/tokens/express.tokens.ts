/** @format */

import { InjectionToken } from '@angular/core';
import type { Request, Response } from 'express';

export const REQUEST: InjectionToken<Request> = new InjectionToken<Request>('REQUEST');
export const RESPONSE: InjectionToken<Response> = new InjectionToken<Response>('RESPONSE');
