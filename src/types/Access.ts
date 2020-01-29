import Namespace from './Namespace';
import { AppHealth } from './Health';

export interface AccessList {
  namespace: Namespace;
  applications: AccessOverview[];
}

export interface AccessOverview {
  name: string;
  istioSidecar: boolean;
}

export interface AccessListItem extends AccessOverview {
  namespace: string;
  healthPromise: Promise<AppHealth>;
}
