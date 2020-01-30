import { connect } from 'react-redux';
import { KialiAppState } from '../../store/Store';
import { activeNamespacesSelector, durationSelector } from '../../store/Selectors';
import * as FilterComponent from '../../components/FilterList/FilterComponent';
import { AccessListItem } from '../../types/Access';
import { DurationInSeconds } from '../../types/Common';
import Namespace from '../../types/Namespace';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { namespaceEquals } from '../../utils/Common';
import { SortField } from '../../types/SortFilters';
import * as AccessListFilters from './FiltersAndSorts';
import { ActiveFilter } from '../../types/Filters';
import { FilterSelected, StatefulFilters } from '../../components/Filters/StatefulFilters';
import * as API from '../../services/Api';
import * as AccessClass from './AccessClass';
import * as AccessFilters from './FiltersAndSorts';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { DurationDropdownContainer } from '../../components/DurationDropdown/DurationDropdown';
import RefreshButtonContainer from '../../components/Refresh/RefreshButton';
import * as React from 'react';

type AccessListComponentState = FilterComponent.State<AccessListItem>;

type ReduxProps = {
  duration: DurationInSeconds;
  activeNamespaces: Namespace[];
};

type AccessListComponentProps = ReduxProps & FilterComponent.Props<AccessListItem>;

class AccessListComponent extends FilterComponent.Component<
  AccessListComponentProps,
  AccessListComponentState,
  AccessListItem
> {
  private promises = new PromisesRegistry();

  constructor(props: AccessListComponentProps) {
    super(props);
    this.state = {
      listItems: [],
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending
    };
  }

  componentDidMount() {
    this.updateListItems();
  }

  componentDidUpdate(prevProps: AccessListComponentProps, _prevState: AccessListComponentState, _snapshot: any) {
    const [paramsSynced] = this.paramsAreSynced(prevProps);
    if (!paramsSynced) {
      this.setState({
        currentSortField: this.props.currentSortField,
        isSortAscending: this.props.isSortAscending
      });
      this.updateListItems();
    }
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  paramsAreSynced = (prevProps: AccessListComponentProps): [boolean, boolean] => {
    const activeNamespacesCompare = namespaceEquals(prevProps.activeNamespaces, this.props.activeNamespaces);
    const paramsSynced =
      prevProps.duration === this.props.duration &&
      activeNamespacesCompare &&
      prevProps.isSortAscending === this.props.isSortAscending &&
      prevProps.currentSortField.title === this.props.currentSortField.title;
    return [paramsSynced, activeNamespacesCompare];
  };

  sortItemList(
    items: AccessListItem[],
    sortField: SortField<AccessListItem>,
    isAscending: boolean
  ): Promise<AccessListItem[]> {
    // Chain promises, as there may be an ongoing fetch/refresh and sort can be called after UI interaction
    // This ensures that the list will display the new data with the right sorting
    return this.promises.registerChained('sort', items, unsorted =>
      AccessListFilters.sortAppsItems(unsorted, sortField, isAscending)
    );
  }

  updateListItems() {
    this.promises.cancelAll();

    const activeFilters: ActiveFilter[] = FilterSelected.getSelected();
    const namespacesSelected = this.props.activeNamespaces.map(item => item.name);

    if (namespacesSelected.length === 0) {
      this.promises
        .register('namespaces', API.getNamespaces())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse.data;
          this.fetchApps(namespaces.map(namespace => namespace.name), activeFilters, this.props.duration);
        })
        .catch(namespacesError => {
          if (!namespacesError.isCanceled) {
            this.handleAxiosError('Could not fetch namespace list', namespacesError);
          }
        });
    } else {
      this.fetchApps(namespacesSelected, activeFilters, this.props.duration);
    }
  }

  fetchApps(namespaces: string[], filters: ActiveFilter[], rateInterval: number) {
    const appsPromises = namespaces.map(namespace => API.getApps(namespace));
    this.promises
      .registerAll('apps', appsPromises)
      .then(responses => {
        let appListItems: AccessListItem[] = [];
        responses.forEach(response => {
          appListItems = appListItems.concat(AccessClass.getAccessItems(response.data, rateInterval));
        });
        return AccessFilters.filterBy(appListItems, filters);
      })
      .then(appListItems => {
        this.promises.cancel('sort');
        this.sortItemList(appListItems, this.state.currentSortField, this.state.isSortAscending)
          .then(sorted => {
            this.setState({
              listItems: sorted
            });
          })
          .catch(err => {
            if (!err.isCanceled) {
              console.debug(err);
            }
          });
      })
      .catch(err => {
        if (!err.isCanceled) {
          this.handleAxiosError('Could not fetch apps list', err);
        }
      });
  }

  render() {
    return (
      <VirtualList rows={this.state.listItems} scrollFilters={false} updateItems={this.updateListItems}>
        <StatefulFilters
          initialFilters={AccessFilters.availableFilters}
          onFilterChange={this.onFilterChange}
          rightToolbar={[
            <DurationDropdownContainer key={'DurationDropdown'} id="app-list-dropdown" />,
            <RefreshButtonContainer key={'Refresh'} handleRefresh={this.updateListItems} />
          ]}
        />
      </VirtualList>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state),
  duration: durationSelector(state)
});

const AccessListContainer = connect(mapStateToProps)(AccessListComponent);

export default AccessListContainer;
