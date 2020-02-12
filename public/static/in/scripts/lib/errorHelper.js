import React from 'react';

export const mergeErrors = (errorArr) => {
	const newErrorArr = [],
		map = {};

	for (let i = 0, len = errorArr.length; i < len; i++) {
		const currentError = errorArr[i];
		let mapMessage;
		if (!map.hasOwnProperty(currentError.field)) {
			mapMessage = `${currentError.message}\n`;
		} else {
			mapMessage = `${map[currentError.field].message}${currentError.message}\n`;
		}
		map[currentError.field] = {
			message: mapMessage,
			redirectUrl: currentError.redirectUrl
		};
	}

	for (let field in map) {
		const processedMsg = map[field].message.replace(/\n$/, '');
		newErrorArr.push({
			field,
			message: processedMsg,
			redirectUrl: map[field].redirectUrl
		});
	}

	return newErrorArr;
}

export const formatErrorMessage = (message, field, type) => {
	return message.split('\n').map((item, i) => {
		let key = (field + type + i).toString('base64');
		return (<p key={key}>{item}</p>);
	});
}