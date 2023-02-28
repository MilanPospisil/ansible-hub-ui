import { t } from '@lingui/macro';
import { Button, ButtonVariant, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { wisdomDenyIndexAPI } from 'src/api';
import { AlertList, AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  scope: string;
  reference: string;
  cancelAction: () => void;
}

export const WisdomModal = (props: IProps) => {
  const [isInDenyIndex, setIsInDenyIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const titleAddFailed = t`Failed to opt in to Wisdom.`;
  const titleRemoveFailed = t`Failed to opt out of Wisdom.`;
  const titleWillBeUsed = t`The ${props.reference} is opt in Wisdom.`;
  const titleWillNotBeUsed = t`The ${props.reference} is opt out from Wisdom.`;

  let title = '';
  switch (props.scope) {
    case 'namespace':
      title = t`Wisdom modal for namespace.`;
      break;
    case 'legacy_namespace':
      title = t`Wisdom modal for legacy namespace.`;
      break;
  }

  useEffect(() => {
    wisdomDenyIndexAPI
      .isInDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(result);
        setLoading(false);
      });
  }, []);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  const removeFromDenyIndex = () => {
    setLoading(true);
    wisdomDenyIndexAPI
      .removeFromDenyIndex(props.scope, props.reference)
      .then(() => {
        setIsInDenyIndex(false);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: titleAddFailed,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  const addToDenyIndex = () => {
    setLoading(true);
    wisdomDenyIndexAPI
      .addToDenyIndex(props.scope, props.reference)
      .then(() => {
        setIsInDenyIndex(true);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: titleRemoveFailed,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  const actions = [];

  if (!loading) {
    if (isInDenyIndex) {
      actions.push(
        <Button
          key='remove'
          onClick={removeFromDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Opt in Wisdom.`}
        </Button>,
      );
    } else {
      actions.push(
        <Button
          key='add'
          onClick={addToDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Opt out of Wisdom.`}
        </Button>,
      );
    }

    actions.push(
      <Button key='add' onClick={() => props.cancelAction()} variant='link'>
        {t`Cancel`}
      </Button>,
    );
  }

  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={props.cancelAction}
      title={title}
      titleIconVariant='warning'
      variant='small'
    >
      <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div>
            {!loading && isInDenyIndex ? titleWillNotBeUsed : titleWillBeUsed}
          </div>
          <br />
          <div>
            Some information about Ansible Wisdom and why it is good to have
            namespaces included in the project.
          </div>
        </div>
      )}
    </Modal>
  );
};
