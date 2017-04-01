var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var user = {};

var users = [
	{ name: "Alex Toth", login: "developer", password: "developer123", role: "LIBRARIAN" },
	{ name: "Random Stranger", login: "stranger", password: "stranger", role: "BORROWER" }
];

var authors = [
	{ name: "Adolf Hitler", birthDate: "1435-05-30" },
	{ name: "Random Stranger", birthDate: "1943-11-21" }
];

var books = [
	{ title: "Mein Kampf", author: "Adolf Hitler", genre: "Comedy" },
	{ title: "How to webtech", author: "Random Stranger", genre: "Comedy" }
];

var genres = [
	"Sci-fi", "Comedy", "Drama", "Romance", "Tragedy"
];

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', function(req, res) {
	res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', function(req, res) {
	//var user = { name: req.body.name, login: req.body.login, password: req.body.password, role: "BORROWER" };
	console.log(req.body.login);
	console.log(req.body.password);
	for (var u in users) {
		if (users[u].login === req.body.login && users[u].password === req.body.password) {
			//res.sendFile(__dirname + '/public/bookList.html');
			res.write('bookList');
			res.end();
			return;
		}
	}
	res.write('login');
	res.end();
	//res.sendFile(__dirname + '/public/login.html');
});

app.get('/authorForm', function(req, res) {
	res.sendFile(__dirname + '/public/authorForm.html');
});

app.get('/bookForm', function(req, res) {
	res.sendFile(__dirname + '/public/bookForm.html');
});

app.get('/authorList', function(req, res) {
	res.sendFile(__dirname + '/public/authorList.html');
});

app.get('/bookList', function(req, res) {
	res.sendFile(__dirname + '/public/bookList.html');
});

app.get('/authors', function(req, res) {
	res.send(authors);
});

app.get('/books', function(req, res) {
	console.log(req.query.author);
	res.send(books);
});

app.get('/genres', function(req, res) {
	res.send(genres);
});

app.post('/addAuthor', function(req, res) {
	var author = { name: req.body.name, birthDate: req.body.birthDate.substring(0, 10) };
	authors.push(author);
	res.sendFile(__dirname + '/public/authorList.html');
});

app.post('/addBook', function(req, res) {
	var book = { title: req.body.title, author: req.body.author, genre: req.body.genre };
	books.push(book);
	res.sendFile(__dirname + '/public/bookList.html');
});

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log("Example app listening at http://%s:%s", host, port);
});
