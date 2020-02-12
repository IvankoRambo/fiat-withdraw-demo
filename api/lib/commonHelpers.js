const URL = require('url').URL;

const getQueryStringParams = qs => {
	if(!qs || !qs.length){
		return {};
	}

	let params = {};

	qs.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), ($0, $1, $2, $3) => {
		params[$1] = $3;
	});

	return params;
}

const getURIComponents = uriStr => {
	const uri = new URL(uriStr);

	return {
		protocol: uri.protocol,
		host: uri.host,
		port: uri.port,
		path: uri.pathname,
		query: uri.search,
		queryParams: uri.search.length > 1 ? getQueryStringParams(uri.search.substr(1)) : {},
		hash: uri.hash,
		url: uri.protocol + '//' + uri.host + uri.pathname
	};
}

const convertMapToQueryString = map => {
	if(!map){
		return '';
	}

	let mapElements = [];

	for(let key in map){
		mapElements.push(encodeURIComponent(key) + '=' + encodeURIComponent(map[key]));
	}

	return mapElements.join('&');
};

const appendParamsToURL = (url, params) => {
	const uri = getURIComponents(url),
		includeHash = arguments.length < 3 ? false : arguments[2];

	let qsParams = Object.assign(uri.queryParams, params),
		result = uri.url + '?' + convertMapToQueryString(qsParams);

	if(includeHash){
		result += uri.hash;
	}

	if(result.indexOf('http') === -1 && result.charAt(0) !== '/'){
		result = '/' + result;
	}

	return result;
};

const generateStr = (len) => {
	len = len || 5;
	let text = '';
	const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < len; i++) {
		text += symbols.charAt(Math.floor(Math.random() * symbols.length));
	}

	return text;
}

const htmlSpecialChars = html => {
	let result = html;

	if (typeof result === 'string') {
		result = html.replace(/[<>"]/g, tag => {
			const charsToReplace = {
				'<': '&lt;',
				'>': '&gt;',
				'"': '&#34;'
			}

			return charsToReplace[tag] || tag;
		});
	}

	return result;
}

module.exports = {
	getURIComponents,
	getQueryStringParams,
	appendParamsToURL,
	convertMapToQueryString,
	generateStr,
	htmlSpecialChars
};