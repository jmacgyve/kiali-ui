import { AccessList, AccessListItem } from '../../types/Access';
import * as API from '../../services/Api';

export const getAccessItems = (data: AccessList, rateInterval: number): AccessListItem[] => {
  if (data.applications) {
    return data.applications.map(app => ({
      namespace: data.namespace.name,
      name: app.name,
      istioSidecar: app.istioSidecar,
      healthPromise: API.getAppHealth(data.namespace.name, app.name, rateInterval, app.istioSidecar)
    }));
  }
  return [];
};
