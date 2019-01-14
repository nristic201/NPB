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

const driver = neo4j.driver('bolt://localhost:11001', neo4j.auth.basic('comi', 'comi'));
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

app.post('/biblioteka/iznajmi', function (req, res) { //biblioteka/iznajmi?id_knjige=id&naziv=nazivBibl&grad=grad

	let id_knjige = req.body.id_knjige;
	let naziv_biblioteke = req.body.naziv;
	let grad = req.body.grad;
	let clan = false;
	getUsersLibraries(korisnik.username_korisnika)
		.then(biblioteke => {
			biblioteke.forEach(bibl => {
				if (bibl.ime_bibl === naziv_biblioteke && bibl.grad_biblioteke === grad) {
					clan = true;
				}
			})
			if (clan) {
				session
					.run("match (k:Knjiga) where ID(k) = {idParam} return k", {
						idParam: id_knjige
					})
					.then(function (result) {

						let broj_kopija = result.records[0]._fields[0].properties.broj_kopija;

						if (broj_kopija > 0) {

							session
								.run("match (k:Knjiga) where ID(k) = {idParam} " +
									"match (n:Korisnik {username: {usernameParam}}) " +
									"merge (n)-[r:Iznajmio {datum: {datumParam}}]->(k) return r", {
										idParam: id_knjige,
										usernameParam: korisnik.username_korisnika(),
										datumParam: new Date()
									})
								.then(function (result) {

									if (result.records.length != 0) {

										session
											.run("match (k:Knjiga) where ID(k) = {idParam} set k.broj_kopija = k.broj_kopija - 1", {
												idParam: id_knjige
											})
											.then(result => {
												if (result.records.length > 0)
													console.log("uspesno iznajmljena knjiga")
												else
													console.log("niste iznajmili knjigu")
											})
											.catch(function (err) {
												console.log(err);
											});
									}
								})
								.catch(function (err) {
									console.log(err);
								});
						} else {

							session
								.run("match (k:Knjiga) where ID(k) = {idParam} " +
									"match (n:Korisnik {username: {usernameParam}}) merge (n)-[z:Zeli]->(k) return z, k", {
										idParam: id_knjige,
										usernameParam: korisnik.username_korisnika
									})
								.then(result => {
									if (result.records_fields[0].length != 0) {
										let naziv_knjige = result.records._fields[1].properties.naziv;
										let izdanje = result.records._fields[1].properties.izdanje;

										//---------------OVDE SOKETI
										subClient.subscribe(naziv_biblioteke + ":" + naziv_knjige + ":" + izdanje, (err, count) => {
											if (err)
												console.log("Try again");

											else {
												console.log("Uspesna prijava za knjigu ", naziv_knjige);
											}
										});
										subClient.on("message", function (channel, message) {
											//soket.send(message) //message je samo "Slobodna knjiga"
										});
										//--------------------------
									}
								})
								.catch(err => console.log(err))
						}
					})
					.catch(function (err) {
						console.log(err);
					});
			}
		})

});

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

app.get('/knjiga/oceni', function (req, res) { //knjiga/oceni?ocena=5&knjiga=naziv&izdanje=izdanje

	let ocena = req.query.ocena;
	let naziv = req.query.naziv;
	let izdanje = req.query.izdanje;

	let sum = 0;
	let num = 0;

	session
		.run("match (k:Knjiga {naziv: {nazivParam}, izdanje: {izdanjeParam}}), (n:Korisnik {username: usernameParam}) merge (k)<-[:Ocenio]-(n)")
		.then(result => {
			session
				.run("match (k:Knjiga {naziv: {nazivParam}, izdanje: {izdanjeParam}})-[o:Ocenio]-(p:Korisnik) return o")
				.then(result => {
					result.records.forEach(record => {
						sum += record._fields[0].properties.ocena;
						num++;
					})
					let prosecna = sum / num;

					session
						.run("match (k:Knjiga {naziv: {nazivParam}, izdanje: {izdanjeParam}}) set k.ocena = {prosecnaParam} return k")
						.then()
						.catch(err => console.log(err))
				})
				.catch(err => console.log(err))
		})
		.catch(err => console.log(err));

});

app.post('/knjiga/review', (req, res) => { //knjiga/oceni////ocena=5&knjiga=naziv&izdanje=izdanje

	let review = req.body.review;
	let naziv = req.body.naziv;
	let izdanje = req.body.izdanje;

	session
		.run("match (k:Korisnik {username: {unParam}}), (n:Knjiga {naziv: nazivParam, izdanje: izdanjeParam}})" +
			" (k)-[r:Reviewed {review: {reviewParam}}]->(n)", {
				uParam: korisnik.username_korisnika,
				nazivParam: naziv,
				izdanjeParam: izdanje,
				reviewParam: review
			})
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