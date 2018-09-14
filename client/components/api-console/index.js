import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

import Console from './Console';
import Page from '../CustomPage';

class ApiConsole extends Component {
	static contextTypes = {
		easdk: PropTypes.object,
	};
	render() {
		return (
			<Page title="API Console" fullWidth
				primaryAction={{ content: 'Send', onAction: () => this.apiConsole.send() }}>
				<Console ref={instance => { this.apiConsole = instance ? instance.getWrappedInstance() : instance; }} />
			</Page>
		);
	}
}

export default ApiConsole;