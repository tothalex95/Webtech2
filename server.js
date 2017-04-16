var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var user;

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

app.get("/authors", function(req, res) {
	var authors = JSON.parse(fs.readFileSync(__dirname + "/authors.json", "utf8"));
	res.send(authors);
});

app.get("/books", function(req, res) {
	var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
	res.send(books);
});

app.get("/genres", function(req, res) {
	var genres = JSON.parse(fs.readFileSync(__dirname + "/genres.json", "utf8"));
	res.send(genres);
});

app.get("/requests", function(req, res) {
	var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
	res.send(requests);
});

app.get("/user", function(req, res) {
	res.send(user);
});

app.post("/login", function(req, res) {
	var users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf8"));
	for (var u of users) {
		if (u.username === req.body.username && u.password === req.body.password) {
			user = u;
			break;
		}
	}
	if (user === undefined) {
		res.status(401).end();
	} else {
		res.send(user);
	}
});

app.post("/logout", function(req, res) {
	user = undefined;
	res.end();
});

app.post("/editUser", function(req, res) {
	if (user === undefined) {
		res.status(403).end();
		return;
	}
	var users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf8"));
	for (var u of users) {
		if (u.id === user.id) {
			if (u.password !== req.body.oldpassword) {
				res.status(409).end();
				return;
			}
			u.name = req.body.name;
			u.password = req.body.newpassword;
			break;
		}
	}
	fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users), "utf8");
	res.end();
});

app.post("/addAuthor", function(req, res) {
	if (user === undefined || user.role !== "LIBRARIAN") {
		res.status(403).end();
		return;
	}
	var authors = JSON.parse(fs.readFileSync(__dirname + "/authors.json", "utf8"));
	for (var a of authors) {
		if (a.name === req.body.name) {
			res.status(409).end();
			return;
		}
	}
	var id = authors.length + 1;
	var author = { "id": id, "name": req.body.name };
	authors.push(author);
	fs.writeFileSync(__dirname + "/authors.json", JSON.stringify(authors), "utf8");
	res.end();
});

app.post("/addBook", function(req, res) {
	if (user === undefined || user.role !== "LIBRARIAN") {
		res.status(403).end();
		return;
	}
	var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
	for (var b of books) {
		if (b.title === req.body.title && b.author === req.body.author) {
			res.status(409).end();
			return;
		}
	}
	var id = books.length + 1;
	var book = { "id": id, "title": req.body.title, "author": req.body.author.name, "genre": "img/default.jpg", "cover": req.body.cover, "quantity": 0, "available": 0 };
	books.push(book);
	fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
	res.end();
});

app.post("/addBookInstance", function(req, res) {
	if (user === undefined || user.role !== "LIBRARIAN") {
		res.status(403).end();
		return;
	}
	var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
	for (var b of books) {
		if (b.id === req.body.id) {
			b.quantity += req.body.quantity;
			b.available += req.body.quantity;
			break;
		}
	}
	fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
	res.end();
});

app.post("/requestBook", function(req, res) {
	var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
	for (var b of books) {
		if (b.id === req.body.id) {
			if (b.available === 0) {
				res.status(409).end();
				return;
			}
			break;
		}
	}
	var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
	for (var r of requests) {
		if (r.borrower === user.name && r.title === req.body.title && r.author === req.body.author) {
			res.status(400).end();
			return;
		}
	}
	var id = requests.length + 1;
	var request = { "id": id, "borrower": user.name, "title": req.body.title, "author": req.body.author };
	requests.push(request);
	fs.writeFileSync(__dirname + "/requests.json", JSON.stringify(requests), "utf8");
	res.end();
});

app.post("/lendBook", function(req, res) {
	if (user === undefined || user.role !== "LIBRARIAN") {
		res.status(403).end();
		return;
	}
	var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
	for (var b of books) {
		if (b.title === req.body.title && b.author === req.body.author) {
			if (b.available === 0) {
				res.status(409).end();
				return;
			} else {
				b.available--;
			}
			break;
		}
	}
	fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
	var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
	for (var r in requests) {
		if (requests[r].id === req.body.id) {
			requests.splice(r, 1);
		}
	}
	fs.writeFileSync(__dirname + "/requests.json", JSON.stringify(requests), "utf8");
	res.end();
});

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log("Library Server listening at http://%s:%s", host, port);
});