import React, { Component } from 'react';
import { AppProvider } from '@shopify/polaris';
import { Switch, Route, Redirect, Link, withRouter } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import RoutePropagator from '@shopify/react-shopify-app-route-propagator';
const Propagator = withRouter(RoutePropagator);

import ApiConsole from './components/api-console'
import PageNotFound from './components/404'

const CustomLinkComponent = ({ children, url, ...rest }) => {
	return (
		<Link to={url || '/'} {...rest}>
			{children || 'LINK'}
		</Link>
	);
};

class App extends Component {
	render() {
		const { apiKey, shopOrigin } = window;

		return (
			<AppProvider shopOrigin={shopOrigin} apiKey={apiKey} /* linkComponent={CustomLinkComponent} */ forceRedirect>
				<Router>
					<React.Fragment>
						<Propagator />
						<Switch>
							<Route exact path="/">
								<Redirect to="/api-console" />
							</Route>
							<Route exact path="/api-console" component={ApiConsole} />
							<Route exact path="/404" component={PageNotFound} />
							<Route>
								<Redirect to="/404" />
							</Route>
						</Switch>
					</React.Fragment>
				</Router>
			</AppProvider>
		);
	}
}

export default App;
