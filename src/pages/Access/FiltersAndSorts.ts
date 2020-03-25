import { SortField } from '../../types/SortFilters';
import { IstioConfigItemAccess } from '../../types/IstioConfigList';
import { FILTER_ACTION_APPEND, FilterType } from '../../types/Filters';
import { TextInputTypes } from '@patternfly/react-core';

export const getType = (item: IstioConfigItemAccess): string => {
  return item.type;
};

export const sortFields: SortField<IstioConfigItemAccess>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a: IstioConfigItemAccess, b: IstioConfigItemAccess) => {
      return a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name);
    }
  },
  {
    id: 'istiotype',
    title: 'Istio Type',
    isNumeric: false,
    param: 'it',
    compare: (a: IstioConfigItemAccess, b: IstioConfigItemAccess) => {
      return getType(a).localeCompare(getType(b)) || a.name.localeCompare(b.name);
    }
  },
  {
    id: 'istioname',
    title: 'Name',
    isNumeric: false,
    param: 'in',
    compare: (a: IstioConfigItemAccess, b: IstioConfigItemAccess) => {
      // On same name order is not well defined, we need some fallback methods
      // This happens specially on adapters/templates where Istio 1.0.x calls them "handler"
      // So, we have a lot of objects with same namespace+name
      return (
        a.name.localeCompare(b.name) || a.namespace.localeCompare(b.namespace) || getType(a).localeCompare(getType(b))
      );
    }
  },
  {
    id: 'configvalidation',
    title: 'Config',
    isNumeric: false,
    param: 'cv',
    compare: (a: IstioConfigItemAccess, b: IstioConfigItemAccess) => {
      let sortValue = -1;
      if (a.validation && !b.validation) {
        sortValue = -1;
      } else if (!a.validation && b.validation) {
        sortValue = 1;
      } else if (!a.validation && !b.validation) {
        sortValue = 0;
      } else if (a.validation && b.validation) {
        if (a.validation.valid && !b.validation.valid) {
          sortValue = -1;
        } else if (!a.validation.valid && b.validation.valid) {
          sortValue = 1;
        } else if (a.validation.valid && b.validation.valid) {
          sortValue = a.validation.checks.length - b.validation.checks.length;
        } else if (!a.validation.valid && !b.validation.valid) {
          sortValue = b.validation.checks.length - a.validation.checks.length;
        }
      }

      return sortValue || a.name.localeCompare(b.name);
    }
  }
];

export const istioNameFilter: FilterType = {
  id: 'istioname',
  title: 'Name',
  placeholder: 'Filter by Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};

export const istioTypeFilter: FilterType = {
  id: 'istiotype',
  title: 'Type',
  placeholder: 'Filter by Type',
  filterType: 'typeahead',
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'ServiceRole',
      title: 'ServiceRole'
    },
    {
      id: 'ServiceRoleBinding',
      title: 'ServiceRoleBinding'
    },
    {
      id: 'AuthorizationPolicy',
      title: 'AuthorizationPolicy'
    }
  ]
};

export const configValidationFilter: FilterType = {
  id: 'configvalidation',
  title: 'Config',
  placeholder: 'Filter by Config Validation',
  filterType: 'select',
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'valid',
      title: 'Valid'
    },
    {
      id: 'warning',
      title: 'Warning'
    },
    {
      id: 'notvalid',
      title: 'Not Valid'
    },
    {
      id: 'notvalidated',
      title: 'Not Validated'
    }
  ]
};

export const availableFilters: FilterType[] = [istioTypeFilter];

export const sortIstioItems = (
  unsorted: IstioConfigItemAccess[],
  sortField: SortField<IstioConfigItemAccess>,
  isAscending: boolean
) => {
  const sortPromise: Promise<IstioConfigItemAccess[]> = new Promise(resolve => {
    resolve(unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a)));
  });

  return sortPromise;
};
