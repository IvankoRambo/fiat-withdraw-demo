//Async creators
const ACCESS_TOKEN_RESOLVE = 'accessTokenResolveEvent';
const dataEndpoint = '/api/data';
const fiatFeesEndpoint = '/api/fiat-fees';

//Resources
export const setResourceObject = () => ({type: 'SET_RESOURCE_OBJECT_MIDDLEWARE'});

//languages
export const setLang = (langType) => ({type: 'ON_INIT_LANG', data: langType});

//Oauth

//Services
export const listServices = () => ({type: 'LIST_SERVICES'});
export const defineServiceType = (currencyID, serviceID) => ({type: 'DEFINE_SERVICE_TYPE', data: {currencyID, serviceID}})

//Accounts
export const setAccountsMiddleware = () => ({type: 'SET_ACCOUNTS_MIDDLEWARE'});
export const toggleHelperService = (currencyID, isShow) => ({type: 'TOGGLE_HELPER_SERVICE', data: {currencyID, show: isShow}});

//SelectedAccount
export const selectAccount = (currencyID) => ({type: 'SELECT_ACCOUNT', data: {name: currencyID}});
export const updateAccounts = (accounts) => ({type: 'UPDATE_ACCOUNTS', data: accounts});
export const resetAccounts = () => ({type: 'RESET_ACCOUNTS'});

//Receive data from service
export const receiveData = data => ({type: 'RECEIVE_DATA', data: data});

//Cards
export const listSavedCards = (cardsData) => ({type: 'LIST_CARDS', data: cardsData});
export const selectCard = (cardID) => ({type: 'SELECT_CARD', data: cardID});

//Fees
export const getFiatFees = () => ({ type: 'FIAT_FEES' });
export const receiveFiatFee = (fiatObject) => ({ type: 'RECEIVE_FIAT_FEE', data: fiatObject });

//Service features
export const toggleWithdraw = (toggleStatus) => ({type: 'TOGGLE_WITHDRAW', data: toggleStatus});

export const fetchData = () => {
	return dispatch => {
		return new Promise(resolve => {
			fetch(dataEndpoint)
				.then(res => res.json())
				.then(json => {
					dispatch(receiveData(json.data));
					fetch(fiatFeesEndpoint)
						.then(res => res.json())
						.then(json => {
							dispatch(receiveFiatFee(json));
							resolve();
							dispatch(setResourceObject());
							dispatch(setLang());
							resolve();
						});
				});
		});
	}
}

