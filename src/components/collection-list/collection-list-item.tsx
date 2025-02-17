import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  LabelGroup,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionListType } from 'src/api';
import {
  CollectionNumericLabel,
  DateComponent,
  DeprecatedTag,
  Logo,
  Tag,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { chipGroupProps, convertContentSummaryCounts } from 'src/utilities';
import { SignatureBadge } from '../signing';
import './list-item.scss';

interface IProps extends CollectionListType {
  showNamespace?: boolean;
  controls?: React.ReactNode;
  displaySignatures: boolean;
  repo?: string;
}

export const CollectionListItem = (props: IProps) => {
  const {
    name,
    latest_version,
    namespace,
    showNamespace,
    controls,
    deprecated,
    displaySignatures,
    repo,
    sign_state,
  } = props;

  const cells = [];

  const company = namespace.company || namespace.name;

  if (showNamespace) {
    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt={t`${company} logo`}
          fallbackToDefault
          image={namespace.avatar_url}
          size='40px'
          unlockWidth
          width='97px'
        />
      </DataListCell>,
    );
  }

  const contentSummary = convertContentSummaryCounts(latest_version.metadata);

  cells.push(
    <DataListCell key='content'>
      <div>
        <Link
          to={formatPath(Paths.collectionByRepo, {
            collection: name,
            namespace: namespace.name,
            repo: repo,
          })}
          data-cy='CollectionList-name'
        >
          {name}
        </Link>
        {deprecated && <DeprecatedTag />}
        {showNamespace ? (
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>Provided by {company}</Trans>
            </Text>
          </TextContent>
        ) : null}
      </div>
      <div className='hub-entry'>{latest_version.metadata.description}</div>
      <div className='hub-entry pf-l-flex pf-m-wrap'>
        {Object.keys(contentSummary.contents).map((type) => (
          <div key={type}>
            <CollectionNumericLabel
              count={contentSummary.contents[type]}
              type={type}
            />
          </div>
        ))}
      </div>
      <div className='hub-entry pf-l-flex pf-m-wrap'>
        <LabelGroup {...chipGroupProps()}>
          {latest_version.metadata.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </LabelGroup>
      </div>
    </DataListCell>,
  );

  cells.push(
    <DataListCell isFilled={false} alignRight key='stats'>
      {controls ? <div className='hub-entry'>{controls}</div> : null}
      <div className='hub-right-col hub-entry'>
        <Trans>
          Updated <DateComponent date={latest_version.created_at} />
        </Trans>
      </div>
      <div className='hub-entry'>v{latest_version.version}</div>
      {displaySignatures ? (
        <SignatureBadge className='hub-entry' signState={sign_state} />
      ) : null}
    </DataListCell>,
  );

  return (
    <DataListItem data-cy='CollectionListItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
};
