import { mergeErrors } from './scripts/lib/errorHelper';
import { timeParse } from 'd3';

export const services = (state, action) => {
	switch(action.type){
		case 'ADD_SERVICE':
			let newService = Object.assign({}, action.data);
			return state.concat([newService]);
		case 'DEFINE_SERVICE_TYPE':
			let servicesWithSubservice = state.map((service) => {
				if(service.serviceID === action.data.serviceID){
					service.serviceSubType = action.data.currencyID;
				}
				else{
					service.serviceSubType = null;
				}
				return service;
			});

			return servicesWithSubservice || [];
		case 'RECEIVE_DATA':
			return action.data.services || state;
		case 'LIST_SERVICES':
		default:
			return state || [];
	}
}

export const urls = (state, action) => {
	switch (action.type){
		case 'RECEIVE_DATA':
			return action.data.urls || {};
		default:
			return state || {};
	}
}

export const resources = (state, action) => {
	switch(action.type){
		case 'RECEIVE_DATA':
			return action.data.resources;
		default:
			return state || {};
	}
}

export const subServiceRoute = (state, action) => {
	switch (action.type) {
		case 'RECEIVE_DATA':
			return action.data.subServiceRoute;
		default:
			return state || {};
	}
}


export const langConfigs = (state, action) => {
	switch (action.type) {
		case 'RECEIVE_DATA':
			return action.data.langConfigs;
		default:
			return state || {};
	}
}

export const resourceMgr = (state, action) => {
	switch(action.type){
		case 'SET_RESOURCE_OBJECT':
			return new action.data.ResourceMgr(action.data.resources);
		default:
			return state || {};
	}
}

export const accounts = (state, action) => {
	switch (action.type) {
		case 'RECEIVE_DATA':
			return action.data.accounts;
		default:
			return state || {};
	}
}

export const cards = (state, action) => {
	switch(action.type){
		case 'LIST_CARDS':
			return action.data || state;
		case 'SELECT_CARD':
			let cardID = action.data;
			let modifiedState = state.map((card) => {
				if(card.id === cardID){
					return Object.assign({}, card, { selected: true });
				}
				return Object.assign({}, card, { selected: false });
			});
			return modifiedState;
		default:
			return state || [];
	}
}


export const fiatWithdrawFee = (state, action) => {
	switch (action.type) {
		case 'RECEIVE_FIAT_FEE':
			return action.data && action.data.fiatWithdrawFee || null;
		default:
			return state || null;
	}
}

export const fiatWithdrawFeatures = (state, action) => {
	switch (action.type){
		case 'TOGGLE_WITHDRAW':
			let isID = action.data,
				value;
			if(isID) {
				value='new';
			} else {
				value='saved';
			}

			if(typeof state.find((status) => status.type === 'TOGGLE_WITHDRAW') === 'undefined'){
				return state.concat([{
					type: 'TOGGLE_WITHDRAW',
					ID: isID,
					value: value
				}]);
			}
			else{
				let modifiedState = state.map((state) => {
					if(state.type === 'TOGGLE_WITHDRAW'){
						return Object.assign(state, {
							ID: isID,
							value: value
						});
					}

					return state;
				});

				return modifiedState;
			}

		default:
			return state || [];
	}
}

export const profileLang = (state, action) => {
	switch (action.type) {
		case 'PROFILE_LANG':
			let profileLang = action.data;
			if (profileLang) {
				profileLang = profileLang.toLowerCase();
			}
			return profileLang || '';
		default:
			return state || '';
	}
}

export const defaultLang = (state, action) => {
	return state || 'en';
}

export const userLang = (state, action) => {
	switch (action.type) {
		case 'userMapping':
			return action.data || '';
		default:
			return state || '';
	}
}

export const captchaLang = (state, action) => {
	switch (action.type) {
		case 'captchaMapping':
			return action.data || '';
		default:
			return state || '';
	}
}

export const responseStatus = (state, action) => {
	return state || [];
}