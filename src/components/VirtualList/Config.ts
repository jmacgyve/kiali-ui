import deepFreeze from 'deep-freeze';
import { sortable } from '@patternfly/react-table';

import { AppListItem } from '../../types/AppList';
import { WorkloadListItem } from '../../types/Workload';
import { ServiceListItem } from '../../types/ServiceList';
import { IstioConfigItem } from '../../types/IstioConfigList';
import * as Renderers from './Renderers';
import { Health } from '../../types/Health';
import { isIstioNamespace } from 'config/ServerConfig';
import { AccessRuleConstraint, ClusterRbacConfigSpec, K8sMetadata, Reference } from '../../types/IstioObjects';

export type SortResource = AppListItem | WorkloadListItem | ServiceListItem;
export type TResource =
  | SortResource
  | IstioConfigItem
  | Reference
  | AccessRuleConstraint
  | ClusterRbacConfigSpec
  | K8sMetadata;
export type Renderer<R extends TResource> = (
  item: R,
  config: Resource,
  icon: string,
  health?: Health
) => JSX.Element | undefined;

// Health type guard
export function hasHealth(r: TResource): r is SortResource {
  return (r as SortResource).healthPromise !== undefined;
}

export const hasMissingSidecar = (r: SortResource): boolean => {
  return !isIstioNamespace(r.namespace) && !r.istioSidecar;
};

type ResourceType<R extends TResource> = {
  name: string;
  column: string;
  param?: string;
  transforms?: any;
  renderer: Renderer<R>;
};

const item: ResourceType<TResource> = {
  name: 'Item',
  param: 'wn',
  column: 'Name',
  transforms: [sortable],
  renderer: Renderers.item
};

const serviceItem: ResourceType<ServiceListItem> = {
  name: 'Item',
  param: 'sn',
  column: 'Name',
  transforms: [sortable],
  renderer: Renderers.item
};

const istioItem: ResourceType<IstioConfigItem> = {
  name: 'Item',
  param: 'in',
  column: 'Name',
  transforms: [sortable],
  renderer: Renderers.item
};

const accessItem: ResourceType<IstioConfigItem> = {
  name: 'Item',
  param: 'in',
  column: 'Name',
  transforms: [sortable],
  renderer: Renderers.accessItem
};

const namespace: ResourceType<TResource> = {
  name: 'Namespace',
  param: 'ns',
  column: 'Namespace',
  transforms: [sortable],
  renderer: Renderers.namespace
};

const health: ResourceType<TResource> = {
  name: 'Health',
  param: 'he',
  column: 'Health',
  transforms: [sortable],
  renderer: Renderers.health
};

const details: ResourceType<AppListItem | WorkloadListItem | ServiceListItem> = {
  name: 'Details',
  param: 'is',
  column: 'Details',
  transforms: [sortable],
  renderer: Renderers.details
};

const configuration: ResourceType<ServiceListItem | IstioConfigItem> = {
  name: 'Configuration',
  param: 'cv',
  column: 'Configuration',
  transforms: [sortable],
  renderer: Renderers.configuration
};

const labelValidation: ResourceType<WorkloadListItem> = {
  name: 'LabelValidation',
  param: 'lb',
  column: 'Label Validation',
  transforms: [sortable],
  renderer: Renderers.labelValidation
};

const workloadType: ResourceType<WorkloadListItem> = {
  name: 'WorkloadType',
  param: 'wt',
  column: 'Type',
  transforms: [sortable],
  renderer: Renderers.workloadType
};

const istioType: ResourceType<IstioConfigItem> = {
  name: 'IstioType',
  param: 'it',
  column: 'Type',
  transforms: [sortable],
  renderer: Renderers.istioType
};

export const IstioTypes = {
  gateway: { name: 'Gateway', url: 'gateways', icon: 'G' },
  hellostring: { name: 'HelloString', url: 'helloString', icon: 'HHH' },
  virtualservice: { name: 'VirtualService', url: 'virtualservices', icon: 'VS' },
  destinationrule: { name: 'DestinationRule', url: 'destinationrules', icon: 'DR' },
  serviceentry: { name: 'ServiceEntry', url: 'serviceentries', icon: 'SE' },
  rule: { name: 'Rule', url: 'rules', icon: 'R' },
  adapter: { name: 'Adapter', url: 'adapters', icon: 'A' },
  template: { name: 'Template', url: 'templates', icon: 'T' },
  quotaspec: { name: 'QuotaSpec', url: 'quotaspecs', icon: 'QS' },
  quotaspecbinding: { name: 'QuotaSpecBinding', url: 'quotaspecbindings', icon: 'QSB' },
  policy: { name: 'Policy', url: 'policies', icon: 'P' },
  meshpolicy: { name: 'MeshPolicy', url: 'meshpolicies', icon: 'MP' },
  servicemeshpolicy: { name: 'ServiceMeshPolicy', url: 'servicemeshpolicy', icon: 'SMP' },
  clusterrbacconfig: { name: 'ClusterRbacConfig', url: 'clusterrbacconfigs', icon: 'CRC' },
  rbacconfig: { name: 'RbacConfig', url: 'rbacconfigs', icon: 'RC' },
  authorizationpolicy: { name: 'AuthorizationPolicy', url: 'authorizationpolicy', icon: 'AP' },
  servicemeshrbacconfig: { name: 'ServiceMeshRbacConfig', url: 'servicemeshrbacconfigs', icon: 'SRC' },
  sidecar: { name: 'Sidecar', url: 'sidercars', icon: 'S' },
  servicerole: { name: 'ServiceRole', url: 'serviceroles', icon: 'SR' },
  servicerolebinding: { name: 'ServiceRoleBinding', url: 'servicerolebindings', icon: 'SRB' }
};

export type Resource = {
  name: string;
  columns: ResourceType<any>[];
  caption?: string;
  icon?: string;
};

//новый класс для проверки таблицы во вкладке Istio Config
//TODO убрать этот класс
const configuration2: ResourceType<ServiceListItem | IstioConfigItem> = {
  name: 'Configuration2',
  param: 'cv2',
  column: 'Configuration2',
  transforms: [sortable],
  renderer: Renderers.configuration2
};

const workloads: Resource = {
  name: 'workloads',
  columns: [item, namespace, workloadType, health, details, labelValidation],
  icon: 'W'
};

const applications: Resource = {
  name: 'applications',
  columns: [item, namespace, health, details],
  icon: 'A'
};

const services: Resource = {
  name: 'services',
  // columns: [serviceItem, namespace, health, details],
  columns: [serviceItem, namespace, health, details, configuration],
  icon: 'S'
};

const istio: Resource = {
  name: 'istio',
  columns: [istioItem, namespace, istioType, configuration2]
  //columns: [istioItem, namespace, istioType, configuration]
};

const access: Resource = {
  name: 'access',
  columns: [accessItem, namespace, istioType]
};

const conf = {
  headerTable: true,
  applications: applications,
  workloads: workloads,
  services: services,
  istio: istio,
  access: access
};

export const config = deepFreeze(conf) as typeof conf;
