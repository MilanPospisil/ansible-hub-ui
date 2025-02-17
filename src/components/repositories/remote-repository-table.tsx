import { t } from '@lingui/macro';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { PulpStatus, RemoteType, UserType } from 'src/api';
import { DateComponent, ListItemActions, SortTable } from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { lastSyncStatus, lastSynced } from 'src/utilities';

interface IProps {
  remotes: RemoteType[];
  updateParams: (p) => void;
  editRemote: (r: RemoteType) => void;
  syncRemote: (distribution: string) => void;
  user: UserType;
  refreshRemotes: () => void;
}

export class RemoteRepositoryTable extends React.Component<IProps> {
  static contextType = AppContext;

  polling: ReturnType<typeof setInterval>;
  refreshOnStatuses = [PulpStatus.waiting, PulpStatus.running];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.polling = setInterval(() => {
      const { remotes } = this.props;
      let refresh = false;
      for (const remote of remotes) {
        for (const repo of remote.repositories) {
          if (repo.last_sync_task) {
            if (this.refreshOnStatuses.includes(repo.last_sync_task.state)) {
              refresh = true;
              break;
            }
          }
        }
      }

      if (refresh) {
        this.props.refreshRemotes();
      }
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  render() {
    const { remotes } = this.props;
    return this.renderTable(remotes);
  }

  private renderTable(remotes) {
    const params = { sort: 'repository' };
    const sortTableOptions = {
      headers: [
        {
          title: t`Remote name`,
          type: 'none',
          id: 'remote',
        },
        {
          title: t`Repositories`,
          type: 'none',
          id: 'repository',
        },
        {
          title: t`Last updated`,
          type: 'none',
          id: 'updated_at',
        },
        {
          title: t`Last synced`,
          type: 'none',
          id: 'last_sync_task.finished_at',
        },
        {
          title: t`Sync status`,
          type: 'none',
          id: 'last_sync_task.error',
        },
        {
          title: '',
          type: 'none',
          id: 'controls',
        },
      ],
    };

    return (
      <table
        aria-label={t`Collection versions`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={() => null}
        />
        <tbody>{remotes.map((remote, i) => this.renderRow(remote, i))}</tbody>
      </table>
    );
  }

  private renderRow(remote, i) {
    const { hasPermission } = this.context;
    const buttons = remote.repositories.length
      ? this.getConfigureOrSyncButton(remote)
      : [
          <Tooltip
            content={t`There are no repos associated with this remote.`}
            key='empty'
          >
            <Button variant='plain'>
              <ExclamationCircleIcon />
            </Button>
          </Tooltip>,
        ];
    const dropdownItems = [
      remote.repositories.length &&
        hasPermission('ansible.change_collectionremote') && (
          <DropdownItem
            key='edit'
            onClick={() => this.props.editRemote(remote)}
          >
            {t`Edit`}
          </DropdownItem>
        ),
    ];
    return (
      <tr key={i}>
        <td>{remote.name}</td>
        <td>{remote.repositories.map((r) => r.name).join(', ')}</td>
        {remote.updated_at ? (
          <td>
            <DateComponent date={remote.updated_at} />
          </td>
        ) : (
          <td>{'---'}</td>
        )}
        <td>{lastSynced(remote) || '---'}</td>
        <td>{lastSyncStatus(remote) || '---'}</td>
        <ListItemActions kebabItems={dropdownItems} buttons={buttons} />
      </tr>
    );
  }

  private getConfigureOrSyncButton(remote: RemoteType) {
    const { hasPermission } = this.context;
    if (!hasPermission('ansible.change_collectionremote')) {
      return null;
    }
    const configButton = [
      <Button
        key='config'
        onClick={() => this.props.editRemote(remote)}
        variant='secondary'
      >
        {t`Configure`}
      </Button>,
    ];

    const syncButton = [
      <Button
        key='sync'
        isDisabled={
          remote.repositories.length === 0 ||
          (remote.last_sync_task &&
            ['running', 'waiting'].includes(remote.last_sync_task.state))
        }
        onClick={() =>
          this.props.syncRemote(
            remote.repositories[0].distributions[0].base_path,
          )
        }
        variant='secondary'
      >
        {t`Sync`}
      </Button>,
    ];

    let remoteType = 'none';

    for (const host of Constants.UPSTREAM_HOSTS) {
      if (remote.url.includes(host)) {
        remoteType = 'community';
        break;
      }
    }

    for (const host of Constants.DOWNSTREAM_HOSTS) {
      if (remote.url.includes(host)) {
        remoteType = 'certified';
        break;
      }
    }

    if (
      remoteType === 'community' &&
      remote.url &&
      remote.name &&
      remote.requirements_file
    ) {
      return syncButton;
    }

    if (
      remoteType === 'certified' &&
      remote.url &&
      remote.name &&
      remote.auth_url
    ) {
      return syncButton;
    }

    if (remoteType === 'none' && remote.url) {
      return syncButton;
    }

    return configButton;
  }
}
