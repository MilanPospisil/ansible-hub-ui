import { CollectionAPI } from 'src/api';

import React from 'react';
import { errorMessage, parsePulpIDFromURL, waitForTask } from 'src/utilities';
import { t, Trans } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';

import { Text, DropdownItem, Checkbox, Tooltip } from '@patternfly/react-core';

import { DeleteModal } from 'src/components';

class DeleteCollectionUtils {
  public getUsedbyDependencies(collection, setDependencies, setAlert) {
    const { name, namespace } = collection;
    CollectionAPI.getUsedDependenciesByCollection(namespace.name, name)
      .then(({ data }) => {
        setDependencies(!data.data.length);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        setAlert({
          variant: 'danger',
          title: t`Dependencies for collection "${name}" could not be displayed.`,
          description: errorMessage(status, statusText),
        });
      });
  }

  public deleteMenuOption(
    noDependencies,
    delete_collection_permission: boolean,
    onClick,
  ) {
    return noDependencies
      ? delete_collection_permission && (
          <DropdownItem
            key='delete-collection-enabled'
            onClick={() => onClick()}
            data-cy='delete-collection-dropdown'
          >
            {t`Delete entire collection`}
          </DropdownItem>
        )
      : delete_collection_permission && (
          <Tooltip
            key='delete-collection-disabled'
            position='left'
            content={
              <Trans>
                Cannot delete until collections <br />
                that depend on this collection <br />
                have been deleted.
              </Trans>
            }
          >
            <DropdownItem isDisabled>
              {t`Delete entire collection`}
            </DropdownItem>
          </Tooltip>
        );
  }

  public deleteModal(
    deleteCollection,
    isDeletionPending,
    confirmDelete,
    collectionVersion,
    cancelAction,
    deleteAction,
    onChange,
  ) {
    return (
      deleteCollection && (
        <DeleteModal
          spinner={isDeletionPending}
          cancelAction={() => cancelAction()}
          deleteAction={() => deleteAction()}
          isDisabled={!confirmDelete || isDeletionPending}
          title={
            collectionVersion
              ? t`Delete collection version?`
              : t`Delete collection?`
          }
        >
          <>
            <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
              {collectionVersion ? (
                <>
                  {deleteCollection.all_versions.length === 1 ? (
                    <Trans>
                      Deleting{' '}
                      <b>
                        {deleteCollection.name} v{collectionVersion}
                      </b>{' '}
                      and its data will be lost and this will cause the entire
                      collection to be deleted.
                    </Trans>
                  ) : (
                    <Trans>
                      Deleting{' '}
                      <b>
                        {deleteCollection.name} v{collectionVersion}
                      </b>{' '}
                      and its data will be lost.
                    </Trans>
                  )}
                </>
              ) : (
                <Trans>
                  Deleting <b>{deleteCollection.name}</b> and its data will be
                  lost.
                </Trans>
              )}
            </Text>
            <Checkbox
              isChecked={confirmDelete}
              onChange={(val) => onChange(val)}
              label={t`I understand that this action cannot be undone.`}
              id='delete_confirm'
            />
          </>
        </DeleteModal>
      )
    );
  }

  public deleteCollection(component, redirect, selectedRepo, addAlert) {
    const { deleteCollection, collectionVersion } = component.state;

    CollectionAPI.deleteCollection(selectedRepo, deleteCollection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);

        const name =
          deleteCollection.name +
          (collectionVersion ? 'v ' + collectionVersion : '');

        waitForTask(taskId).then(() => {
          addAlert({
            variant: 'success',
            title: (
              <Trans>
                Collection &quot;{name}
                &quot; has been successfully deleted.
              </Trans>
            ),
          });

          component.setState({
            collectionVersion: null,
            deleteCollection: null,
            isDeletionPending: false,
          });

          if (redirect) {
            component.setState({
              redirect: formatPath(Paths.namespaceByRepo, {
                repo: component.context.selectedRepo,
                namespace: deleteCollection.namespace.name,
              }),
            });
          }

          if (component.load) {
            component.load();
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        component.setState({
          collectionVersion: null,
          deleteCollection: null,
          isDeletionPending: false,
        });

        addAlert({
          variant: 'danger',
          title: t`Collection "${name}" could not be deleted.`,
          description: errorMessage(status, statusText),
        });
      });
  }
}

export const deleteCollectionUtils = new DeleteCollectionUtils();
