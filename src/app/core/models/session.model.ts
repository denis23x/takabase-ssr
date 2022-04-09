/** @format */

export interface Session {
  id: number;
  ua: SessionUa;
  fingerprint: string;
  ip: SessionIp;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUa {
  os: SessionUaOS;
  ua: string;
  cpu: SessionUaCPU;
  device: SessionUaDevice;
  engine: SessionUaEngine;
  browser: SessionUaBrowser;
}

export interface SessionUaOS {
  name: string;
  version: string;
}

export interface SessionUaCPU {
  architecture: string;
}

export interface SessionUaDevice {
  model: string;
  type: string;
  vendor: string;
}

export interface SessionUaEngine {
  name: string;
  version: string;
}

export interface SessionUaBrowser {
  name: string;
  major?: string;
  version: string;
}

export interface SessionIp {
  organization_name: string;
  region?: string;
  accuracy?: number;
  asn: number;
  organization: string;
  timezone?: string;
  longitude: string;
  country_code3?: string;
  area_code: string;
  ip: string;
  city?: string;
  country?: string;
  continent_code?: string;
  country_code?: string;
  latitude: string;
}
