import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import InternalApp from './InternalApp';

const mapStateToProps = ({userLang, defaultLang }) => ({
	userLang,
	defaultLang
});

class App extends React.Component {
	render(){
		return (<BrowserRouter>
				<div className='app'>
					<Route path="/" exact component={InternalApp} />
				</div>
			</BrowserRouter>);
	}
}

export default connect(mapStateToProps)(App);