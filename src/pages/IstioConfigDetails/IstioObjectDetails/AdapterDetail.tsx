import * as React from 'react';
import { IstioAdapter, ObjectValidation } from '../../../types/IstioObjects';
import LocalTime from '../../../components/Time/LocalTime';
import DetailObject from '../../../components/Details/DetailObject';
import {
  Card,
  CardBody,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  TooltipPosition
} from '@patternfly/react-core';
import { Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import GlobalValidation from '../../../components/Validations/GlobalValidation';
import { checkForPath } from '../../../types/ServiceInfo';
import ValidationList from '../../../components/Validations/ValidationList';
import Labels from '../../../components/Label/Labels';
import { serviceLink } from '../IstioConfigDetailsPage';

interface AdapterDetailProps {
  namespace: string;
  istioAdapter: IstioAdapter;
  validation?: ObjectValidation;
}

class AdapterDetail extends React.Component<AdapterDetailProps> {
  globalStatus() {
    const validation = this.props.validation;
    if (validation && !validation.valid) {
      return <GlobalValidation validation={validation} />;
    } else {
      return undefined;
    }
  }

  subsetValidation(subsetIndex: number) {
    const checks = checkForPath(this.props.validation, 'spec/subsets[' + subsetIndex + ']');
    return <ValidationList checks={checks} tooltipPosition={TooltipPosition.right} />;
  }

  columnsSubsets() {
    return [
      {
        title: 'Status',
        props: {}
      },
      {
        title: 'Name',
        props: {}
      },
      {
        title: 'Labels',
        props: {}
      },
      {
        title: 'Traffic Policy',
        props: {}
      }
    ];
  }

  rowsSubset() {
    const subsets = this.props.istioAdapter.spec.subsets || [];
    return subsets.map((subset, index) => ({
      cells: [
        { title: this.subsetValidation(index) },
        { title: subset.name },
        { title: <Labels key={'subset-labels-' + index} labels={subset.labels} /> },
        { title: <DetailObject name="" detail={subset.trafficPolicy} /> }
      ]
    }));
  }

  generateSubsets() {
    const subsets = this.props.istioAdapter.spec.subsets || [];
    const hasSubsets = subsets.length > 0;

    return (
      <GridItem>
        <Card>
          <CardBody>
            <>
              <Text component={TextVariants.h2}>Subsets</Text>
              {hasSubsets ? (
                <Table
                  aria-label={'CHECK ADAPTER OVERVIEW'}
                  variant={TableVariant.compact}
                  cells={this.columnsSubsets()}
                  rows={this.rowsSubset()}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              ) : (
                <Text component={TextVariants.p}>No subsets defined.</Text>
              )}
            </>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  rawConfig() {
    const istioAdapter = this.props.istioAdapter;
    const globalStatus = this.globalStatus();
    const isValid = !globalStatus;
    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>ADAPTER OVERVIEW</Text>
            {globalStatus}
            <Stack>
              <StackItem id={'created_at'}>
                <Text component={TextVariants.h3}>Created at</Text>
                <LocalTime time={istioAdapter.metadata.creationTimestamp || ''} />
              </StackItem>
              <StackItem id={'resource_version'}>
                <Text component={TextVariants.h3}>Resource Version</Text>
                {istioAdapter.metadata.resourceVersion}
              </StackItem>
              <StackItem id={'hosts'}>
                {istioAdapter.spec.host && (
                  <>
                    <Text component={TextVariants.h3}>Host</Text>
                    {serviceLink(istioAdapter.metadata.namespace || '', istioAdapter.spec.host, isValid)}
                  </>
                )}
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  trafficPolicy() {
    const istioAdapter = this.props.istioAdapter;
    const hasTrafficPolicy = !!istioAdapter.spec.trafficPolicy;

    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>Traffic Policy</Text>
            <Stack>
              <StackItem id={'traffic_policy'}>
                {hasTrafficPolicy ? (
                  <DetailObject name="" detail={istioAdapter.spec.trafficPolicy} />
                ) : (
                  <Text component={TextVariants.p}>No traffic policy defined.</Text>
                )}
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  render() {
    return (
      <div className="container-fluid container-cards-pf">
        <Grid gutter={'md'}>
          {this.rawConfig()}
          {/*{this.trafficPolicy()}*/}
          {/*{this.generateSubsets()}*/}
        </Grid>
      </div>
    );
  }
}

export default AdapterDetail;
