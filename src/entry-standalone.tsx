import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { Constants } from 'src/constants';
// constants must be imported after the translation library, so the translations will be loaded sooner than constants
import 'src/i18n';
import 'src/l10n';
import App from './loaders/standalone/loader';

// Entrypoint for compiling the app to run in standalone mode
if (!window.location.pathname.includes(UI_BASE_PATH)) {
  // react-router v6 won't redirect to base path by default
  window.history.pushState(null, null, UI_BASE_PATH);
}

ReactDOM.render(
  <React.StrictMode>
    <Router basename={UI_BASE_PATH}>
      <I18nProvider i18n={i18n}>
        <HelloWorld />
        <App />
      </I18nProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);

function HelloWorld() {
  const { t } = useTranslation();

  const name = 'Ansible';
  const componentName = 'Trans';

  return (
    <div>
      <h1>
        {t(
          'This.This is the hello world application: Test for simple translation.',
        )}
      </h1>
      <div>
        Non existing key - should be blank or left alone:{' '}
        {t('non existing key - have to show this text untranslated')}
      </div>
      <Trans i18nKey='transTest'>
        Hello <strong>{{ name }}</strong>: this is {{ componentName }} test.{' '}
        <a href='/'>Empty link</a>
      </Trans>
      <div>This should show empty string after={t('empty translation')}</div>
      <div>{t('Escaped code example.')}</div>
      <div>
        Orders:
        {t('order', { count: 1, ordinal: true })},
        {t('order', { count: 52, ordinal: true })},
        {t('order', { count: 33, ordinal: true })},
        {t('order', { count: 34, ordinal: true })},
      </div>
      <div>
        The system contains {t('role', { count: 1, ordinal: true })}. The system
        contains {t('role', { count: 12, ordinal: true })}. The system contains{' '}
        {t('role', { count: 0, ordinal: true })}.
      </div>
      <div>Constants test: {Constants.STATIC_TRANSLATION_TEST}</div>
    </div>
  );
}
