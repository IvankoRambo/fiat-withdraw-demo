import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Service from './Service';

const InternalMain = () => {
	return (<React.Fragment>
			<main className="js-internal-main">
				<Route path="/" exact component={Service} />
			</main>
		</React.Fragment>);
}

export default InternalMain;