import * as React from 'react';
import { RenderContent } from '../../components/Nav/Page';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import AccessListContainer from './AccessListComponent';
import * as AccessListFilters from './FiltersAndSorts';

const AccessListPage: React.SFC<{}> = () => {
  return (
    <RenderContent>
      <AccessListContainer
        currentSortField={FilterHelper.currentSortField(AccessListFilters.sortFields)}
        isSortAscending={FilterHelper.isCurrentSortAscending()}
      />
    </RenderContent>
  );
};

export default AccessListPage;
