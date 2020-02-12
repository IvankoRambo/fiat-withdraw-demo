import ResourceMgr from './lib/resourceMgr';

export const langMiddlewareCreator = () => {
	return store => next => action => {

		switch (action.type) {
			case 'ON_INIT_LANG':
				let currentState = store.getState(),
					langType = action.data || 'userMapping',
					{ langConfigs, country, defaultLang, profileLang, isLoggedIn, urls } = currentState;

				const setLangEndpoint = urls.host + urls.sections.extendedProfile;

				profileLang = langType === 'userMapping' ? profileLang : '';
				const localStorageData = langType === 'userMapping' ? localStorage.getItem('lang') : null;
				let currentLang = profileLang || localStorageData;
				if (!currentLang) {
					const currentMap = langConfigs[langType];
					for (let prop in currentMap) {
						if (currentMap[prop].indexOf(country) !== -1) {
							currentLang = prop;
							break;
						}
					}

					if (!currentLang) {
						currentLang = defaultLang;
					}
				}

				if (langType === 'userMapping') {
					localStorage.setItem('lang', currentLang);
				}
				store.dispatch({ type: langType, data: currentLang });
				if (isLoggedIn && langType === 'userMapping') {
					putJson(setLangEndpoint, {
						'lang': capitalizeFirstLetter(currentLang)
					});
				}
				break;
		}

		return next(action);
	}
}

export const resourceObjectMiddlewereCreator = () => {
	return store => next => action => {
		switch(action.type){
			case 'SET_RESOURCE_OBJECT_MIDDLEWARE':
				let resources = store.getState().resources;
				store.dispatch({type: 'SET_RESOURCE_OBJECT', data: {resources, ResourceMgr}});
				break;
		}

		return next(action);
	}
}