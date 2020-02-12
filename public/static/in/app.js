import es6Promise from 'es6-promise';
import 'isomorphic-fetch';

es6Promise.polyfill();

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import * as reducers from './reducers';
import * as actions from './actions';
reducers.routing = routerReducer;

import App from './components/App';
import * as middleware from './scripts/middleware';

import * as progress from './scripts/progress';

const store = createStore(combineReducers(reducers), applyMiddleware(
	thunkMiddleware,
	middleware.resourceObjectMiddlewereCreator(),
	middleware.langMiddlewareCreator()
));

const run = () => {
	const state = store.getState();
	ReactDOM.render((<Provider store={store}>
			<App />
		</Provider>), document.getElementById('root'));
};

const init = () => {
	progress.show();
	store.dispatch(actions.fetchData())
		.then(() => {
			progress.remove();
			run();
			store.subscribe(run);
		});
};

init();