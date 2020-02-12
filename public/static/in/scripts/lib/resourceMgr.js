class ResourceMgr {
	constructor(config){
		this.resources = config;
	}

	get(resourceName, section, params, language, defaultLanguage){
		params = params || [];
		section = section || 'info'
		let resource = this.resources[section][resourceName];

		if (typeof resource === 'object' && (language || defaultLanguage)) {
			let langResource = resource[language];
			if (typeof langResource === 'undefined') {
				langResource = resource[defaultLanguage];
			}

			if (typeof langResource !== 'undefined') {
				resource = langResource;
			}
		}

		if (resource) {
			for(let i = 0, len = params.length; i<len; i++){
				resource = resource.replace(new RegExp("\\{" + i + "\\}", "g"), params[i]);
			}
		}

		return resource;
	}
}

export default ResourceMgr;