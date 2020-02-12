let express = require('express'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	server = express(),
	session = require('express-session'),
	api = require('./api/rest');

const commonHelper = require('./api/lib/commonHelpers');

server.use(express.static(__dirname + '/public'))
	.use(session({
		secret: commonHelper.generateStr(20),
		resave: true,
		saveUninitialized: true
	}))
	.use(bodyParser.json())
	.use('/api', api)
	.get('*', function(req, res){
		res.sendFile(__dirname + '/public/main.html');
	});

server.listen('3000');