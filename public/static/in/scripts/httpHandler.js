const responseHandler = response => {
	const contentType = response.headers.get('content-type');
	if(response.status >= 200 && response.status < 300){
		return contentType ? response.json() : response;
	}

	var err = new Error('Request error');
	err.body = null;
	try{
		err.body = contentType ? response.json() : response;
	}catch(e){}
	err.status = response.status;
	throw err;
}

export const getJson = url => {
	return fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	}).then(responseHandler);
}