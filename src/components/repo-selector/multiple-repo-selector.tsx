import { t } from '@lingui/macro';
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  DropdownToggleCheckbox,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Spinner,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
} from 'src/api';
import { Repository } from 'src/api/response-types/repositories';
import {
  AppliedFilters,
  CheckboxRow,
  CompoundFilter,
  Pagination,
  SortTable,
} from 'src/components';

interface IProps {
    allRepositories: Repository[];
    fixedRepos : string[];
    loadRepos : (setRepositoryList, setLoading, setItemsCount) => void;
    selectedRepos : string[];
    setSelectedRepos : (selectedRepos : string[]) => void;
}

export const MultipleRepoSelector = (props: IProps) => {
  const [isSelectorChecked, setIsSelectorChecked] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [repositoryList, setRepositoryList] = useState<Repository[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    page_size: 10,
    sort: 'name',
  });

  /*
  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }*/

  function changeSelection(name) {
    if (props.fixedRepos.includes(name)) {
      return;
    }

    const checked = props.selectedRepos.includes(name);

    if (checked) {
      // remove
      props.setSelectedRepos(props.selectedRepos.filter((element) => element != name));
    } else {
      // add
      props.setSelectedRepos([...props.selectedRepos, name]);
    }
  }

  /*
  function loadRepos() {
    // modify params
    const par = { ...params };
    par['pulp_label_select'] = 'pipeline=approved';
    par['ordering'] = par['sort'];
    delete par['sort'];
    setLoading(true);

    Repositories.list(par)
      .then((data) => {
        setLoading(false);
        setRepositoryList(data.data.results);
        setItemsCount(data.data.count);
      })
      .catch(({ response: { status, statusText } }) => {
        setLoading(false);
        addAlert({
          title: t`Failed to load repositories.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }*/

  function renderLabels() {
    const labels = (
      <>
        <LabelGroup>
          {props.selectedRepos.map((name) => {
            let label = null;
            if (props.fixedRepos.includes(name)) {
              label = <Label>{name}</Label>;
            } else {
              label = (
                <Label onClose={() => changeSelection(name)}>{name}</Label>
              );
            }
            return <>{label} </>;
          })}
        </LabelGroup>
      </>
    );

    return (
      <>
        <Flex>
          <FlexItem>
            <b>{t`Selected`}</b>
          </FlexItem>
          <FlexItem>{labels}</FlexItem>
        </Flex>
      </>
    );
  }

  useEffect(() => {
    props.loadRepos(setRepositoryList, setLoading, setItemsCount);
  }, [params]);

  /*useEffect(() => {
    const fixedReposLocal = [];
    const selectedReposLocal = [];

    // check for approval repos that are already in collection and select them in UI
    // this is handling of situation when collection is in inconsistent state
    props.collectionVersion.repository_list.forEach((repo) => {
      const count = props.allRepositories.filter((r) => r.name == repo).length;
      if (count > 0) {
        fixedReposLocal.push(repo);
        selectedReposLocal.push(repo);
      }
    });

    setSelectedRepos(selectedReposLocal);
    setFixedRepos(fixedReposLocal);
  }, []);*/

  function renderMultipleSelector() {
    function onToggle(isOpen: boolean) {
      setIsSelectorOpen(isOpen);
    }

    function onFocus() {
      const element = document.getElementById('toggle-split-button');
      element.focus();
    }

    function onSelect() {
      setIsSelectorOpen(false);
      onFocus();
    }

    function selectAll() {
      props.setSelectedRepos(props.allRepositories.map((a) => a.name));
      setIsSelectorChecked(true);
    }

    function selectPage() {
      const newRepos = [...props.selectedRepos];

      repositoryList.forEach((repo) => {
        if (!props.selectedRepos.includes(repo.name)) {
          newRepos.push(repo.name);
        }
      });

      props.setSelectedRepos(newRepos);
      setIsSelectorChecked(true);
    }

    function deselectAll() {
        props.setSelectedRepos(props.fixedRepos);
      setIsSelectorChecked(false);
    }

    function deselectPage() {
      const newSelectedRepos = props.selectedRepos.filter(
        (repo) =>
        props.fixedRepos.includes(repo) ||
          !repositoryList.find((repo2) => repo2.name == repo),
      );
      props.setSelectedRepos(newSelectedRepos);
      setIsSelectorChecked(false);
    }

    function onToggleCheckbox() {
      setIsSelectorChecked(!isSelectorChecked);
      if (isSelectorChecked) {
        deselectPage();
      } else {
        selectPage();
      }
    }

    const dropdownItems = [
      <DropdownItem
        onClick={selectPage}
        key='select-page'
      >{t`Select page (${repositoryList.length} items)`}</DropdownItem>,
      <DropdownItem
        onClick={selectAll}
        key='select-all'
      >{t`Select all (${props.allRepositories.length} items)`}</DropdownItem>,
      <DropdownSeparator key='separator' />,
      <DropdownItem
        onClick={deselectPage}
        key='deselect-page'
      >{t`Deselect page (${repositoryList.length} items)`}</DropdownItem>,
      <DropdownItem
        onClick={deselectAll}
        key='deselect-all'
      >{t`Deselect all (${props.allRepositories.length} items)`}</DropdownItem>,
    ];

    return (
      <Dropdown
        onSelect={onSelect}
        toggle={
          <DropdownToggle
            splitButtonItems={[
              <DropdownToggleCheckbox
                id='split-button-toggle-checkbox'
                key='split-checkbox'
                aria-label='Select all'
                checked={isSelectorChecked}
                onChange={onToggleCheckbox}
              />,
            ]}
            onToggle={onToggle}
            id='toggle-split-button'
          />
        }
        isOpen={isSelectorOpen}
        dropdownItems={dropdownItems}
      />
    );
  }

  function renderTable() {
    const sortTableOptions = {
      headers: [
        {
          title: t`Name`,
          type: 'alpha',
          id: 'name',
        },
      ],
    };

    return (
      <>
        <table
          aria-label={t`Collection versions`}
          className='hub-c-table-content pf-c-table'
        >
          <SortTable
            options={sortTableOptions}
            params={params}
            updateParams={(p) => setParams(p)}
          />
          <tbody>
            {repositoryList.map((repo, i) => (
              <CheckboxRow
                rowIndex={i}
                key={repo.name}
                isSelected={props.selectedRepos.includes(repo.name)}
                onSelect={() => {
                  changeSelection(repo.name);
                }}
                isDisabled={props.fixedRepos.includes(repo.name)}
                data-cy={`ApproveModal-CheckboxRow-row-${repo.name}`}
              >
                <td>
                  <div>{repo.name}</div>
                  <div>{repo.description}</div>
                </td>
              </CheckboxRow>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <>
          {renderLabels()}
          <div className='toolbar hub-toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>{renderMultipleSelector()}</ToolbarItem>
                <ToolbarItem>
                  <CompoundFilter
                    inputText={inputText}
                    onChange={(text) => {
                      setInputText(text);
                    }}
                    updateParams={(p) => setParams(p)}
                    params={params}
                    filterConfig={[
                      {
                        id: 'name__icontains',
                        title: t`Repository`,
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>

            <Pagination
              params={params}
              updateParams={(p) => setParams(p)}
              count={itemsCount}
              isTop
            />
          </div>
          <div>
            <AppliedFilters
              updateParams={(p) => {
                setParams(p);
                setInputText('');
              }}
              params={params}
              ignoredParams={['page_size', 'page', 'sort']}
              niceNames={{
                name__icontains: t`Name`,
              }}
            />
          </div>

          {loading ? <Spinner /> : renderTable()}

          <div className='footer'>
            <Pagination
              params={params}
              updateParams={(p) => setParams(p)}
              count={itemsCount}
            />
          </div>
    </>
  );
};
