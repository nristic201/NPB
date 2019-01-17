const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const redis = require('redis');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const Knjiga = require("../knjiga.js");
const Pisac = require("../pisac.js");
const Biblioteka = require("../biblioteka.js");
const Korisnik = require("../Korisnik.js");
const BibliotekaBasicView = require("./BibliotekaBasicView.js");
const _ = require("underscore");
const BookBasicView = require("./BookBasicView.js");
const UserBasicView = require("./UserBasicView.js");

const app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('handlebars', exphbs({defaultLayout}));
// app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'comi'));
const session = driver.session();

//redis klijenti
let client = redis.createClient();
let pubClient = redis.createClient();
let subClient = redis.createClient();

pubClient.on('connect', () => {
	console.log("Pub connected");
})
subClient.on('connect', () => {
	console.log("Sub connected");
})
client.on('connect', function () {
	console.log('Connected to Redis');
});

let status = true;
let arrray = [];
let kriterijum = '';
let username;
let password;
let korisnik = new Korisnik("Milica", "Martinovic", "comi", "comi");


app.get('/', function (req, res) {

	if (status) {

		let knjigePrijatelja = [];
		let knjigeMojiZanrovi = [];

		var promises = [];

		var promisesGenre = [];

		getFollowees(korisnik.username_korisnika)
			.then(prijatelji => {
				let locKnjige = [];

				prijatelji.forEach(prijatelj => {
					promises.push(
						getFolloweeBooks(prijatelj)
						.then(friendsBooks => {
							//console.log(friendsBooks);
							knjigePrijatelja.push.apply(knjigePrijatelja, friendsBooks);
						})
						.catch(err => {
							console.log(err);
						})
					)
				})
				Promise.all(promises).then(() => {
						return new Promise((resolve, reject) => {
							let uniqKnjige = _.uniq(knjigePrijatelja, function (ime) {
								return ime;
							})
							knjigePrijatelja = uniqKnjige;
							//console.log(knjigePrijatelja);
							resolve(knjigePrijatelja);
						})
					})
					.then(knjigeP => {

						getMyGenres(korisnik.username_korisnika)
							.then(zanrovi => {
								//console.log(zanrovi);
								zanrovi.forEach(zanr => {
									promisesGenre.push(
										getBooksByGenre(zanr)
										.then(books => {
											knjigeMojiZanrovi.push.apply(knjigeMojiZanrovi, books);
										})
										.catch(err => console.log(err))
									)
								})
								Promise.all(promisesGenre).then(() => {

									knjigeMojiZanrovi = _.uniq(knjigeMojiZanrovi, function (p) {
										return p.naziv
									});

									knjigePrijatelja = _.unique(knjigePrijatelja, function (p) {
										return p.naziv
									});
								})
							})
					});
			})
	} else {
		let booksByocena = getBooksByOcena();
	}

});

function getFollowees(username) {

	let prijatelji = [];

	return new Promise(function (resolve, reject) {
		client.smembers(username + ":followees", function (err, reply) {

			if (reply.length === 0) {

				session
					.run("match (a:Korisnik {username: {usernameParam}})-[p:Prati]->(b:Korisnik) return b", {
						usernameParam: username
					})

					.then(function (result) {

						result.records.forEach(function (record) {

							let un = record._fields[0].properties.username;
							client.sadd(username + ":followees", un);
							prijatelji.push(un);
						});
						resolve(prijatelji);

					})
					.catch(function (err) {
						reject(err);
						console.log(err);
					});
			} else {

				prijatelji = reply;
				resolve(prijatelji);
			}

		});
	})
};

function getFolloweeBooks(prijatelj) {

	let knjige = [];

	return new Promise(function (resolve, reject) {

		client.smembers(prijatelj + ":knjige", function (error, reply) {
			if (reply.length === 0) {

				session
					.run("match(k:Korisnik {username: {unParam}})-[r:Ocenio]->(a:Knjiga)<-[n:Napisao]-(p:Pisac) return a, p", {
						unParam: prijatelj
					})
					.then(function (result) {
						result.records.forEach(function (record) {
							let naziv = record._fields[0].properties.naziv;
							let izdanje = record._fields[0].properties.izdanje;
							let ocena = record._fields[0].properties.ocena;
							let pisacIme = record._fields[1].properties.ime;
							let pisacPrezime = record._fields[1].properties.prezime;
							let knjiga = new BookBasicView(naziv, pisacIme + " " + pisacPrezime, izdanje, ocena);
							let knjigaCache = naziv + "*" + izdanje + "*" + ocena + "*" + pisacIme + "*" + pisacPrezime;
							knjige.push(knjiga);
							client.sadd(prijatelj + ":knjige", knjigaCache);
						});
						resolve(knjige);
					})
					.catch(function (err) {
						console.log(err);
						reject(err);
					});
			} else {
				let locKnjige = reply;
				locKnjige.forEach(knjiga => {
					let pom = knjiga.split("*");
					let knjiga1 = new BookBasicView(pom[0], pom[3] + " " + pom[4], pom[1], pom[2]);
					knjige.push(knjiga1);
				})
				resolve(knjige);
			}
		});
	})

}

app.post('/register', function (req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let ime = req.body.ime;
	let prezime = req.body.prezime;

	session
		.run("create (n:Korisnik {ime: {imeParam}, prezime: {prezimeParam}, username: {usernameParam}, password: {passwordParam} } ) return n")
		.then(function (result) {
			if (result.records.length === 1) {
				console.log("Usepsna registracija"); // status = logged in?
				korisnik = new Korisnik(ime, prezime, username, password);
				status = true;
			}
		})
		.catch(function (err) {
			console.log("Neuspesna registracija");
		})
});

<<<<<<< HEAD
=======
app.get('/addFollowee', function(req, res) { //addFolloweeeeeeeeeeeeeee?username=NekiUsername

	let followeeUsername = res.query.username;
	session
		.run("match (a:Korisnik {username: {usernameParam}}), (b:Korisnik {username: {followeeParam}}) merge (a)-[r:Prati]->(b) return r, b",
		)
		.then(function(result) {
			if(result.records._fields[0]!=null) {
				console.log("Uspesno zapracen korisink");
				let ime_followee = result.records._fields[1].properties.ime;
				let prezime_followee = result.records._fields[1].properties.prezime;
				followee = new Korisnik(ime_followee, prezime_followee, followeeUsername, "");
				korisnik.addFollowee(followee);

				//let followeCache

				//client.sadd(korisnik.username_korisnika + ":followee", foll)
			}
			else {
				console.log("Fail");
			}
		})
		.catch(function(err) {
			console.log(err);
		})
});

app.get('/unfollow', (req,res)=> {
	let username = req.body.username;

	session
		.run("match (k:Korisnik {username: {followee}})<-[p:Prati]-(a:Korisnik {username: meParam}) delete p",
			{meParam: korisnik.username, followee: username})
		.then(result => {
			if(result)
				console.log('uspesno')
			else 
				console.log('neuspesno')
		})
		.catch(err => console.log(err));
});

app.get('/pisac', function(req, res) { //  /pisac?imePisca=Kristijan&prezimePisca=Andersen

	let imePisca = req.query.imePisca;
	let prezimePisca = req.query.prezimePisca;

	let pisac = new Pisac(imePisca, prezimePisca);

	let knjige = [];

	client.smembers(imePisca+prezimePisca+':knjige', (err, reply) => {
		if(reply.length === 0) {
			session
				.run('match (n:Pisac {ime:{imeParam}, prezime: {prezimeParam}})-[r:Napisao]-(b:Knjiga) return b', 
				{imeParam:imePisca, prezimeParam:prezimePisca})
				.then(function(result){

					if(result.records.length === 0) {
					/*	res.render('index', {
							status: status,
							knjige: arrray,
							kriterijum: kriterijum
						});*/
					}
					else {

						result.records.forEach(function(record) {

							let id = record._fields[0].identity.low;
							let naziv = record._fields[0].properties.naziv;
							let izdanje = record._fields[0].properties.izdanje;
							let broj_kopija = record._fields[0].properties.broj_kopija;
							let zanr = record._fields[0].properties.zanr;
							knjige.push(new Knjiga(id, naziv, izdanje, broj_kopija, "",zanr, ""));
						})
						let filter_knjige = _.uniq(knjige, function(p) { return p.naziv; });
						
						pisac.knjige_pisca(filter_knjige);
						//filter_knjige sadrze knjige koje je pisac napisao
						//samo bez ponavljanja
						//jer se pisac vezuje za vise istih knjiga sa razlicitim siframa
						
						/* res.render('pisac', {
							pisac: pisac //pisac sadrzi ime, prez i knjige koje je napisao
						});*/
					}

					session.close();
				})
				.catch(function(error){
					console.log(error);
				});

		}
		else {
			
		}
	})
});

app.get('/logout', function(res, req) {
	status = false;
	korisnik = null;
});
>>>>>>> 4cf956e8b218c5fd76e58b8ff66bedfda081d422

app.post('/login', handleLogin);

function handleLogin(req, res) {

	username = req.body.username;
	password = req.body.password;
	console.log("ovde");

	client.HGETALL("korisnik", function (err, reply) {

		if (reply === null) {

			console.log("uslo");
			session
				.run('match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n', {
					usernameParam: username,
					passwordParam: password
				})
				.then(parser.parse)
				.then(function (result) {


					let ime = result.records[0]._fields[0].properties.ime;
					let prezime = result.records[0]._fields[0].properties.prezime;
					let username = result.records[0]._fields[0].properties.username;
					let password = result.records[0]._fields[0].properties.password;
					korisnik = new Korisnik(ime, prezime, username, password);

					client.hmset("korisnik", "ime", ime, "prezime", prezime, "username", username, "password", password);
					client.expire("korisnik", 3600);

					status = true;

					session
						.run("match (k:Korisnik {username: {unParam}})-[r:Registrovan_u]->(b:Biblioteka) return b", {
							unParam: korisnik.username
						})
						.then(function (result) {

							let i = 0;

							result.records.forEach(function (record) {
								let imeBibl = record._fields[0].properties.ime;
								let grad = record._fields[0].properties.grad;
								let biblioteka = new Biblioteka(imeBibl, grad);

								client.hmset("bibliotekeKorisnika" + i.toString(),
									"imeBiblioteke", imeBibl, "grad", grad);

								korisnik.addBiblioteka(biblioteka);
								i++;
							})
						})
						.catch(function (err) {
							console.log(err);
						});

					session.close();
				})
				.catch(function (error) {
					console.log(error);
				});
		} else {
			//console.log("ovde3");
			console.log(reply);
			if (reply.username === username && reply.password === password) {
				korinsik = new Korisnik(reply.ime, reply.prezime.reply.username, reply.password);
				status = true;
			}
		}
	})

}

app.post('/biblioteka/oslobodi', function (req, res) { //biblioteka/iznajmi?id_knjige=id&naziv=nazivBibl&grad=grad

	let id_knjige = req.body.id_knjige;
	let naziv_biblioteke = req.body.naziv;
	let grad = req.body.grad;

	session
		.run("match (a:Knjiga) where ID(a) = {idParam} match (k:Korisnik  {username: {unParam}}) where (k)-[o:Iznajmio]->(a) delete o", {
			idParam: id_knjige,
			unParam: korisnik.username_korisnika
		})
		.then(result => {
			if (result != null) {
				session
					.run("match (k:Knjiga) where ID(k) = {idParam} set k.broj_kopija = k.broj_kopija + 1", {
						idParam: id_knjige
					})
					.then(result => {
						//----------------------------------------------
						pubClient.publish(naziv_biblioteke + ":" + naziv_knjige + ":" + izdanje, "Knjiga slobodna");
						//----------------------------------------------
					})
					.catch(function (err) {
						console.log(err);
					});
			}
		})
		.catch();
});

app.post('/knjiga/oceni', function (req, res) { //knjiga/oceni?ocena=5&knjiga=naziv&izdanje=izdanje

	let isbn = req.body.isbn;
	let ocena = req.body.ocena;
	let username = req.body.username;

	let sum = 0;
	let num = 0;

	session
		.run("match (k:Knjiga {ISBN: {isbnParam}}), (n:Korisnik {username: usernameParam}) merge (k)<-[:Ocenio {ocena: {ocenaParam}}]-(n)",
				{isbnParam:isbn, usernameParam: username, ocenaParam: ocena})
		.then(result => {
			session
				.run("match (k:Knjiga {ISBN: {isbnParam}})-[o:Ocenio]-(p:Korisnik) return o")
				.then(parser.parse)
				.then(result => {
					result.forEach(record => {
						sum += record.ocena;
						num++;
					})
					let prosecna = sum / num;

					session
						.run("match (k:Knjiga {ISBN: {isbnParam}}) set k.ocena = {prosecnaParam} return k",
								{posecnaParam: prosecna})
						.then(parser.parse)
						.then(result => {
							console.log(result)
						})
						.catch(err => console.log(err))
				})
				.catch(err => console.log(err))
		})
		.catch(err => console.log(err));

});

<<<<<<< HEAD
app.post('/knjiga/review', (req, res) => { //knjiga/oceni////ocena=5&knjiga=naziv&izdanje=izdanje
=======
app.post('/knjiga/review', (req, res) => {//knjiga/review//review=adaffs
>>>>>>> 4cf956e8b218c5fd76e58b8ff66bedfda081d422

	let review = req.body.review;
	let naziv = req.body.naziv;
	let izdanje = req.body.izdanje;

	session
<<<<<<< HEAD
		.run("match (k:Korisnik {username: {unParam}}), (n:Knjiga {naziv: nazivParam, izdanje: izdanjeParam}})" +
			" (k)-[r:Reviewed {review: {reviewParam}}]->(n)", {
				uParam: korisnik.username_korisnika,
				nazivParam: naziv,
				izdanjeParam: izdanje,
				reviewParam: review
			})
=======
		.run("match (k:Korisnik {username: {unParam}}), (n:Knjiga {naziv: nazivParam, izdanje: izdanjeParam}}) create" +
		" (k)-[r:Reviewed {review: {reviewParam}}]->(n)", {uParam:korisnik.username_korisnika, nazivParam: naziv, izdanjeParam: izdanje,
		reviewParam: review})
>>>>>>> 4cf956e8b218c5fd76e58b8ff66bedfda081d422
		.then(result => {

			if (result.records.length != 0) {
				console.log("uspesan review")
			} else
				console.log("neuspesan review");
		})
		.catch(err => console.log(err));
});

app.listen(3000);

console.log("Server Started on Port 3000");

module.exports = app;