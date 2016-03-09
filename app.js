var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressLayouts = require('express-ejs-layouts'),
	expressSession = require('express-session'),
	routes = require('./routes');
	
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/static'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({secret: 'keyboard cat',
						resave: false,
						saveUninitialized: false}));
app.use('/', routes);


app.get('/', function(req, res) {
	res.send('Newdot is coming');
});

app.listen(function () {
	console.log('Connected to server in port ' + app.get('port'));
});