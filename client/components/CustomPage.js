import React, { Component } from 'react';
import { Page as PolarisPage } from '@shopify/polaris';
import * as PropTypes from 'prop-types';

class Page extends Component {
	static contextTypes = {
		easdk: PropTypes.object,
	};
	render() {
		return (
			<PolarisPage {...this.props}
				actionGroups={[
					{
						title: 'Examples',
						actions: [
							{ content: 'API Console', url: 'api-console' },
							{ content: 'Unite Workshop', url: 'unite-workshop' },
						],
					},
				]}>
				{this.props.children }
			</PolarisPage>
		);
	}
}

export default Page;