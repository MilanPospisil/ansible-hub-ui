import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  CodeBlock,
  CodeBlockCode,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { CollectionVersionDetail } from 'src/api/response-types/collection';
import { useContext } from 'src/loaders/app-context';

interface IProps {
  version: CollectionVersionDetail;
}

export const DownloadSignatureGridItem = ({ version }: IProps) => {
  const { display_signatures } = useContext().featureFlags;
  const [show, setShow] = useState(false);

  // No signature object or the signatures is empty
  if (!display_signatures || version.metadata.signatures?.length < 1) {
    return null;
  }

  return (
    <>
      <GridItem>
        <Split hasGutter>
          <SplitItem className='install-title'>{t`Signature`}</SplitItem>
          <SplitItem>
            <Button
              style={{ padding: 0 }}
              variant={ButtonVariant.link}
              icon={<DownloadIcon />}
              data-cy='toggle-signature-button'
              onClick={() => {
                setShow(!show);
              }}
            >
              {show ? t`Hide the signature` : t`Show the signature`}
            </Button>
          </SplitItem>
        </Split>
      </GridItem>
      <GridItem>
        {show &&
          version.metadata.signatures.map(({ signature }, idx) => (
            <CodeBlock key={idx}>
              <CodeBlockCode>{signature}</CodeBlockCode>
            </CodeBlock>
          ))}
      </GridItem>
    </>
  );
};
