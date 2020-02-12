const express = require('express'),
	fetch = require('node-fetch'),
	bodyParser = require('body-parser'),
	server = express(),
	device = require('device'),
	externalip = require('externalip'),
	geoip = require('geoip-lite');

const urls = require('../configs/urls'),
	fiatFees = require('../configs/fiatFees'),
	langConfigs = require('../configs/langConfigs'),
	resources = require('../configs/resources'),
	serviceList = require('../configs/serviceList'),
	subServiceRoute = require('../configs/subServiceRoute');

let constantStore = {
	'services': serviceList,
	'accounts': [{"currency":"UAH","amount":387.98}, {"currency":"BTC","amount":0.00023464}]
};

server
	.use(bodyParser.urlencoded({extended: true}))
	.use(bodyParser.json())
	.use(function(req, res, next){
		req.currentDevice = device(req.get('User-Agent'));
		next();
	})
	.use(function(req, res, next){
		if (req.headers['cf-connecting-ip']) {
			req.customRemoteAddress = req.headers['cf-connecting-ip'];
			next();
		} else {
			externalip(function(err, ip){
				if(err){
					req.customRemoteAddress = '';
					next();
				}

				req.customRemoteAddress = ip;
				next();
			});
		}
	})
	.use(function (req, res, next) {
		if (req.customRemoteAddress) {
			const geoInfo = geoip.lookup(req.customRemoteAddress);
			if (geoInfo) {
				req.userCountry = geoInfo.country;
				req.userTimeZone = geoInfo.timezone;
			}
		}

		next();
	})
	.get('/data', function(req, res){
		let currentDevice = req.currentDevice && req.currentDevice.type || 'desktop',
			remoteAddress = req.customRemoteAddress,
			country = req.userCountry,
			timezone = req.userTimeZone,
			dataJSON;
		constantStore = Object.assign({}, constantStore,
			{ currentDevice: currentDevice },
			{ remoteAddress: remoteAddress },
			{ country: country },
			{ timezone: timezone },
			{ urls: urls },
			{ langConfigs: langConfigs },
			{resources: resources},
			{subServiceRoute: subServiceRoute}
		);

		dataJSON = { data: constantStore };
	 	res.json(dataJSON);
	})
	.get('/cards', function(req, res){
		const cards = [{"id":"57512b06-5112-4b48-8ae4-d1b9cc5b7723","number":"4000000000000010","processorType":"Privat"}];
		res.status(200);
		res.json(cards);
	})
	.get('/fiat-fees', function(req, res) {
		res.status(200);
		res.json(fiatFees);
	});

module.exports = server;