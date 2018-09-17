import * as React from 'react';
import 'isomorphic-fetch';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from '../client/store';
import App from './App';

function renderApp() {
  render(
      <Provider store={store}>
        <App />
      </Provider>,
    document.getElementById('root')
  );
}

renderApp();

if (module.hot) {
  module.hot.accept();
}
