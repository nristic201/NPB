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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const driver = neo4j.driver('bolt://localhost:11001', neo4j.auth.basic('comi', 'comi'));
const session = driver.session();

//redis client
let client = redis.createClient();
client.on('connect', function() {
	console.log('Connected to Redis');
});

let status = true;
let arrray = [];
let kriterijum = '';
let username;
let password;
let korisnik = new Korisnik("Milica", "Martinovic", "comi", "comi");


app.get('/', function(req, res){

	if(status) {
		let knjigePrijatelja=[];
		let knjigeMojiZanrovi=[];

		var promises = [];

		var promisesGenre = [];

		 getFollowees()
		 .then(prijatelji => {
			let locKnjige =[];
			
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
					return new Promise ((resolve, reject) => {
					let uniqKnjige = _.uniq(knjigePrijatelja, function(ime) { return ime ;})
					knjigePrijatelja = uniqKnjige;
					//console.log(knjigePrijatelja);
					resolve(knjigePrijatelja);
				})
			})
			.then(knjigeP => {

				getMyGenres()
				.then(zanrovi =>{
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

						knjigeMojiZanrovi = _.uniq(knjigeMojiZanrovi, function(p) {return p.naziv});

						knjigePrijatelja = _.unique(knjigePrijatelja, function(p) {return p.naziv});
					
						res.render("indeks.ejs", {
							friendsBooks: knjigePrijatelja,
							myGenreBooks: knjigeMojiZanrovi
						})
					})
				})
			})
			;
		})
	}
	else {
		let booksByocena = getBooksByOcena();
		res.render("indeks.ejs", {
			topRatedBooks: booksByocena
		})
	}
		
});

function getBooksByGenre(zanr) {

	let knjige = [];
	return new Promise((resolve, reject) => {
		client.smembers(zanr +":knjige", (err, reply) => {
			if(reply.length === 0) {
				session
					.run("match (k:Knjiga {zanr: {zanrParam}})-[n:Napisao]-(p:Pisac) return k, p", {zanrParam: zanr})
					.then(result => {
						result.records.forEach(function(record) {
							let naziv = record._fields[0].properties.naziv;
							let izdanje = record._fields[0].properties.izdanje;
							let ocena = record._fields[0].properties.ocena;
							let pisacIme = record._fields[1].properties.ime;
							let pisacPrezime = record._fields[1].properties.prezime;
							let knjiga = new BookBasicView(naziv, pisacIme + " " + pisacPrezime, izdanje, ocena);
							let knjigaCache = naziv  + "*" + izdanje + "*" + ocena + "*" + pisacIme + "*" + pisacPrezime;
							knjige.push(knjiga);
							client.sadd(zanr + ":knjige", knjigaCache);
						});
						resolve(knjige);
					})
			}
			else {
				let locKnjige = reply;
				locKnjige.forEach(knjiga => {
					let pom = knjiga.split("*");
					let knjiga1 = new BookBasicView(pom[0], pom[3] + " " + pom[4], pom[1], pom[2]);
					knjige.push(knjiga1);
				})
				resolve(knjige);
			}
		})
	})
}

function getMyGenres() {
	return new Promise((resolve, reject) => {
		let zanrovi  = [];
		client.smembers(korisnik.username + ":knjige", (err, reply) => {
			if(reply.length === 0) {
				session
					.run("match (k:Knjiga)<-[o:Ocenio]-(n:Korisnik {username: {unParam}}) return k", {unParam : korisnik.username})
					.then(result => {
					//	console.log(result.records[0]);
						result.records.forEach(record => {
							zanrovi.push(record._fields[0].properties.zanr);
							client.sadd(korisnik.username + ":zanrovi", record._fields[0].properties.zanr);
						})
						resolve(zanrovi);
						
					})
					.catch(err => console.log(err))
			}
			else {
				resolve(reply);
			}
		})
	})
}

function getBooksByOcena() {
	
	let knjige = [];

	client.smembers("najbolje_knjige", function(err, reply) {
		if(reply.length === 0) {

			session
				.run("match (n:Knjiga)<-[r:Napisao]-(p:Pisac) return n,p order by n.ocena DESC limit 20")
				.then(function(result) {
					result.records.forEach(record => {
							let naziv = record._fields[0].properties.naziv;
							let izdanje = record._fields[0].properties.izdanje;
							let ocena = record._fields[0].properties.ocena;
							let pisacIme = record._fields[1].properties.ime;
							let pisacPrezime = record._fields[1].properties.prezime;

							client.sadd("najbolje_knjige",  naziv  + "*" + izdanje + "*" + ocena + "*" + pisacIme + "*" + pisacPrezime);

							let knjiga = new BookBasicView(naziv, pisacIme + " " + pisacPrezime, izdanje, ocena);
							console.log(knjiga);

							knjige.push(knjiga);
					})
				})
				.catch(err => console.log(err));
		}
		else {
			let locKnjige = reply;
			locKnjige.forEach(knjiga => {
				let pom = knjiga.split("*");
				let knjiga1 = new BookBasicView(pom[0], pom[3] + " " + pom[4], pom[1], pom[2]);
				knjige.push(knjiga1);
			})
		}
	});
	return knjige;
}

function getFollowees() {

	let prijatelji = [];
	
	return new Promise(function (resolve, reject) {
		client.smembers(korisnik.username + ":prijatelji", function(err, reply) {

		if(reply.length === 0) {

			session
				.run("match (a:Korisnik {username: {usernameParam}})-[p:Prati]->(b:Korisnik) return b", 
				{usernameParam: korisnik.username})

				.then(function(result) {
				
					result.records.forEach(function(record){

						let username = record._fields[0].properties.username;
						client.sadd(korisnik.username + ":prijatelji", username);
						prijatelji.push(username);
					});
					resolve(prijatelji);

				})
				.catch(function(err){
					reject(err);
					console.log(err);
				});
		}
		else {

			prijatelji = reply;
			resolve(prijatelji);
		}
		
	});
})
};

function getFolloweeBooks(prijatelj) {

	let knjige = [];
	return new Promise(function(resolve, reject) {

		client.smembers(prijatelj + ":knjige",function(error, reply) {
				if(reply.length === 0) {

					session
						.run("match(k:Korisnik {username: {unParam}})-[r:Ocenio]->(a:Knjiga)<-[n:Napisao]-(p:Pisac) return a, p",
						{unParam: prijatelj})
						.then(function(result) {
							result.records.forEach(function(record) {
								let naziv = record._fields[0].properties.naziv;
								let izdanje = record._fields[0].properties.izdanje;
								let ocena = record._fields[0].properties.ocena;
								let pisacIme = record._fields[1].properties.ime;
								let pisacPrezime = record._fields[1].properties.prezime;
								let knjiga = new BookBasicView(naziv, pisacIme + " " + pisacPrezime, izdanje, ocena);
								let knjigaCache = naziv  + "*" + izdanje + "*" + ocena + "*" + pisacIme + "*" + pisacPrezime;
								knjige.push(knjiga);
								client.sadd(prijatelj + ":knjige", knjigaCache);
							});
							resolve(knjige);
						})
						.catch(function(err) {
							console.log(err);
							reject(err);
						});
				}
				else {
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

app.post('/register',function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let ime = req.body.ime;
	let prezime = req.body.prezime;
	
	session
		.run("create (n:Korisnik {ime: {imeParam}, prezime: {prezimeParam}, username: {usernameParam}, password: {passwordParam} } ) return n")
		.then(function(result){
			if(result.records.length === 1) {
				console.log("Usepsna registracija"); // status = logged in?
				korisnik = new Korisnik(ime, prezime, username, password);
				status = true;
			}
		})
		.catch(function(err){
			console.log("Neuspesna registracija");
		})
});

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
			}
			else {
				console.log("Fail");
			}
		})
		.catch(function(err) {
			console.log(err);
		})
});

app.get('/pisac', function(req, res) { //  /pisac?imePisca=Kristijan&prezimePisca=Andersen

	let imePisca = req.query.imePisca;
	let prezimePisca = req.query.prezimePisca;

	let pisac = new Pisac(imePisca, prezimePisca);

	let knjige = [];

	session
		.run('match (n:Pisac {ime:{imeParam}, prezime: {prezimeParam}})-[r:Napisao]-(b:Knjiga) return b', 
		{imeParam:imePisca, prezimeParam:prezimePisca})
		.then(function(result){

			if(result.records.length === 0) {
				res.render('index', {
					status: status,
					knjige: arrray,
					kriterijum: kriterijum
				});
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
				
				 res.render('pisac', {
					pisac: pisac //pisac sadrzi ime, prez i knjige koje je napisao
				});
			}

			session.close();
		})
		.catch(function(error){
			console.log(error);
		});

});

app.get('/logout', function(res, req) {
	status = false;
	korisnik = null;
});

app.post('/login', handleLogin);

function handleLogin(req, res) {

	username = req.body.username;
	password = req.body.password;
	console.log("ovde");

	client.HGETALL("korisnik", function(err, reply) {
	
		if(reply === null) {
			
			console.log("uslo");
			session
				.run('match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n', 
				{usernameParam:username, passwordParam:password})
				.then(function(result) {
					if(result.records.length === 0) {
						res.render('index', {
							status: status,
							knjige: arrray,
							kriterijum: kriterijum
						});
					}
					else{

						let ime = result.records[0]._fields[0].properties.ime;
						let prezime = result.records[0]._fields[0].properties.prezime;
						let username = result.records[0]._fields[0].properties.username;
						let password = result.records[0]._fields[0].properties.password;
						korisnik = new Korisnik(ime, prezime, username, password);

						client.hmset("korisnik", "ime", ime, "prezime", prezime, "username", username, "password", password);
						client.expire("korisnik", 3600);

						status = true;
						
						session
							.run("match (k:Korisnik {username: {unParam}})-[r:Registrovan_u]->(b:Biblioteka) return b", 
							{unParam: korisnik.username})
							.then(function(result) {

								let i = 0;

								result.records.forEach(function(record) {
									let imeBibl = record._fields[0].properties.ime;
									let grad = record._fields[0].properties.grad;
									let biblioteka = new Biblioteka(imeBibl, grad);

									client.hmset("bibliotekeKorisnika" + i.toString(),
									"imeBiblioteke", imeBibl, "grad", grad);

									korisnik.addBiblioteka(biblioteka);
									i++;
								})
							})
							.catch(function(err) {
								console.log(err);
							});
						

						res.render('index', {
							status: status,
							knjige: arrray,
							kriterijum: kriterijum
						});
					}
					session.close();
				})
				.catch(function(error){
					console.log(error);
				});
		}
		else {
			//console.log("ovde3");
			console.log(reply);
			if(reply.username === username && reply.password === password) {
				korinsik = new Korisnik(reply.ime, reply.prezime. reply.username, reply.password);
				status = true;
			}
		}
	})
	
}

app.post('/search', function(req, res) {

	kriterijum = req.body.kriterijum;
	let value = req.body.value;
	arrray = [];

	if(kriterijum === 'knjige') {

		let selectedMenuItem = req.body.selectedMenuItem; // naziv ili zanr

		if(selectedMenuItem === "naziv") {

			session
				.run('match(n:Knjiga) where n.naziv =~ {nazivParam} return n', {nazivParam:'.*' + value + '.*'})
				.then(function(result){

					result.records.forEach(function(record){
						arrray.push({
							id: record._fields[0].identity.low,
							naziv: record._fields[0].properties.naziv
						});
					});
					res.render('index', {
						status: status,
						array: arrray,
						kriterijum: kriterijum
					});

					session.close();
				})
				.catch(function(error){
					console.log(error);
				});
		}
		else {
			
			session
				.run("match (n:Knjiga {zanr: {zanrParam}}) return n", {zanrParam: value})
				.then(function(result) {
					result.records.forEach(function(record) {
						arrray.push({
							id: record._fields[0].identity.low,
							naziv: record._fields[0].properties.naziv
						})
					});

					let uniqKnjige = _.uniq(arrray, function(p) { return p.naziv; });
					
					res.render('index', {
						status: status,
						array: uniqKnjige,
						kriterijum: kriterijum
					});

					session.close();
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	}
	else if(kriterijum === 'pisci') {

		session
		.run('match(n:Pisac) where n.ime =~ {pisacParam} or n.prezime =~ {pisacParam} return n', {pisacParam:'.*' + value + '.*'})
		.then(function(result){

			result.records.forEach(function(record){
				arrray.push({
					id: record._fields[0].identity.low,
					ime: record._fields[0].properties.ime, 
					prezime: record._fields[0].properties.prezime
				});
			});
			res.render('index', {
				status: status,
				array: arrray,
				kriterijum: kriterijum
			});

			session.close();
		})
		.catch(function(error){
			console.log(error);
		});
	}
	else if(kriterijum === "biblioteke"){

		session
		.run('match(n:Biblioteka) where n.ime =~ {biblParam} return n', {biblParam:'.*' + value + '.*'})
		.then(function(result){

			result.records.forEach(function(record){
				arrray.push({
					id: record._fields[0].identity.low,
					ime: record._fields[0].properties.ime
				});
			});
			res.render('index', {
				status: status,
				array: arrray,
				kriterijum: kriterijum
			});

			session.close();
		})
		.catch(function(error){
			console.log(error);
		});
	}
	else if(kriterijum === "korisnici") {
		session
		.run('match(n:Korisnik) where n.ime =~ {korisnikParam} return n', {korisnikParam:'.*' + value + '.*'})
		.then(function(result) {

			result.records.forEach(function(record){
				arrray.push({
					id: record._fields[0].identity.low,
					ime: record._fields[0].properties.ime,
					prezime: record._fields[0].properties.prezime,
					username: record._fields[0].properties.username
				});
			});
			res.render('index', {
				status: status,
				array: arrray,
				kriterijum: kriterijum
			});

			session.close();
		})
		.catch(function(error){
			console.log(error);
		});
	}
});

app.get('/knjiga', function(req, res) { // knjiga?naziv=Crvenkapa&izdanje=Prvo izdanje
	
	let naziv = req.query.naziv;
	let izdanje  = req.query.izdanje;
	let knjige = [];
	let pisac;
	session
		.run('match(n:Knjiga {naziv: {knjigaParam}, izdanje: {izdanjeParam}}) return n', 
		{knjigaParam: naziv, izdanjeParam: izdanje})
		.then(function (result) {
			
			result.records.forEach(function(record){
				let k;
				let id_knjige = record._fields[0].identity.low;
				let naziv_knjige = record._fields[0].properties.naziv;
				let	izdanje = record._fields[0].properties.izdanje;
				let	broj_kopija = record._fields[0].properties.broj_kopija;
				let isIznajmljena = record._fields[0].properties.iznajmljena;
				let zanr = record._fields[0].properties.zanr;
				k = new Knjiga(id_knjige, naziv_knjige, izdanje, broj_kopija, isIznajmljena, zanr, "");
				knjige.push(k);
			});
			
			session
				.run('match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a', 
				{nazivParam: naziv})
				.then(function(res){
					res.records.forEach(function(record) {
						let ime = record._fields[0].properties.ime;
						let prezime = record._fields[0].properties.prezime;
						pisac = new Pisac(ime,prezime);
					});
					
					knjige.forEach(function(knjiga){
						knjiga.pisac_knjige = pisac;
						session
							.run('match (b:Biblioteka)-[r:Ima]-(k:Knjiga {naziv: {nazivParam}}) return b', 
							{nazivParam: knjiga.naziv_knjige})
							.then(function (result) {
								result.records.forEach(function(record){
									let imeBibl = record._fields[0].properties.ime;
									let grad = record._fields[0].properties.grad;
									let biblioteka = new Biblioteka(imeBibl, grad);
									knjiga.biblioteka_knjige = biblioteka;
								})
								console.log(knjiga);	
							})
						.catch(function(err){
							console.log(err);
						});
					})
				})
			.catch(function(err){
				console.log(err);
			});
			
			res.render('knjiga.ejs', {
				status: status,
				knjigeArr: knjige,
				//kriterijum: kriterijum
			});

		})
		.catch(function(error){
			console.log(error);
		})
});

function getUsersBorrowedBooks(userame) {
	let knjige = [];
	return new Promise((resolve, reject) => {
		client.smembers(userame + ":borrowed_books", (err ,reply) =>  {
			if(reply.length === 0) {
				session
					.run("match (n:Korisnik {username: {usernameParam}})-[r:Iznajmio]-(k:Knjiga)<-[:Napisao]-(p:Pisac) return k, r, p", 
					{usernameParam: korisnik.username_korisnika})
				
					.then(function(result) {
						result.records.forEach(function(record){
			
							let naziv_knjige = record._fields[0].properties.naziv;
							let izdanje = record._fields[0].properties.izdanje;
							let ocena = record._fields[0].properties.ocena;
							let pisacIme = record._fields[2].properties.ime;
							let pisacPrezime = record._fields[2].properties.prezime;

							let bCache = naziv_knjige + "*" + pisacIme + " " + pisacPrezime + "*" + izdanje + "*" + ocena;
							let k = new BookBasicView(naziv_knjige, pisacIme + "*" + pisacPrezime, izdanje, ocena);
							client.sadd(userame + "borrowed_books", bCache);
							knjige.push(k);
						})
						resolve(knjige);
						
					})
					.catch(function(error){
						console.log(error);
					});
			}
			else {
				reply.forEach(knjiga => {
					let pom = knjiga.split("*");
					let k = new BookBasicView(pom[0], pom[1] + " " + pom[2], pom[3], pom[4]);
					knjige.push(k);
				})
				resolve(knjige);
			}
		})
		
	})
}

function getUsersFollowers(username) {
	let followers = [];
	return new Promise((resolve, reject) => {
		client.smembers(username + ":followers", (err, reply)=> {
			if(reply.length === 0) {
				session
					.run("match (a:Korisnik)-[r:Prati]->(b:Korisnik {username: {usernameParam}}) return a", 
					{usernameParam: username})
					.then(function (result) {
						result.records.forEach(function(record){
							let ime_follower = record._fields[0].properties.ime;
							let prezime_follower = record._fields[0].properties.prezime;
							let username_follower = record._fields[0].properties.username;
							let fCache = ime_follower + "*" + prezime_follower + "*" + username_follower;
							client.sadd(username + ":followers", fCache);
							let follower = new UserBasicView(ime_follower,prezime_follower, username_follower);
							followers.push(follower);
							//console.log(follower);
						})
						//console.log(follower);
						resolve(followers);
					})	
					.catch(function(err) {
						console.log(err);
					})
			}
			else {
				reply.forEach(follower => {
					let pom = follower.split("*");
					let f = new UserBasicView(pom[0], pom[1], pom[2])
					followers.push(f);
				})
				resolve(followers);
			}
		})
		
	})
	
}

function getUsersLibraries(username) {
	let libraries = [];
	return new Promise((resolve, reject) => {
		client.smembers(username + ":biblioteke", (err, reply) => {
			if(reply.length === 0) {
				session
					.run("match (a:Korisnik {username: {usernameParam}})-[r:Registrovan_u]->(b:Biblioteka) return b", 
					{usernameParam: korisnik.username_korisnika})
					.then(function (result) {
						result.records.forEach(function(record){
							let ime = record._fields[0].properties.ime;
							let grad = record._fields[0].properties.grad;
							let b = new BibliotekaBasicView(ime, grad);
							let bCache = ime + "*" + grad;
							client.sadd(username + ":biblioteke", bCache);
							libraries.push(b);
						})
						resolve(libraries);
					})	
					.catch(function(err) {
						console.log(err);
					})
			}
			else {
				let bibl = reply;
				bibl.forEach(b=> {
					let pom = b.split("*");
					let lib = new BibliotekaBasicView(pom[0], pom[1]);
					libraries.push(lib);
				})
				resolve(libraries);
			}
		})
		
	})
}

app.get('/profile', function(req, res) { 

	getUsersBorrowedBooks(korisnik.username_korisnika)
	.then(books => {
		korisnik.knjige_korisnika = books;
		getFollowees()
		.then(followees => {
			korisnik.followees_korisnika = followees;
			getUsersFollowers(korisnik.username_korisnika)
			.then(followers => {
				korisnik.followers_korisnika = followers;
				getUsersLibraries(korisnik.username_korisnika)
				.then(libraries => {
					korisnik.biblioteke_korisnika = libraries;
					console.log(korisnik);
					res.render("profile.ejs", {
						korisnik: korisnik
					})
				})

			})
		})
	})

});

//ako korisnik nije registrovan u biblioteci, onda ne moze da iznajmi knjigu iz te biblioteke
app.get('/biblioteka',function(req,res) { //biblioteka?imeBiblioteke=asdas

	console.log(req.query);
	let imeBiblioteke = req.query.imeBiblioteke;

	let biblioteka;

	session
		.run("match (n:Biblioteka {ime: {imeParam}})-[r:Ima]-(k:Knjiga) return k,n", {imeParam: imeBiblioteke})
		.then(function(result){
			
			let grad = result.records[0]._fields[1].properties.grad;
			biblioteka = new Biblioteka(imeBiblioteke, grad);

			result.records.forEach(function(record){
				let id_knjige = record._fields[0].identity.low;
				let naziv_knjige = record._fields[0].properties.naziv;
				let izdanje = record._fields[0].properties.izdanje;
				let broj_kopija = record._fields[0].properties.broj_kopija.toString();
				let isIznajmljena = record._fields[0].properties.iznajmljena;
				let zanr = record._fields[0].properties.zanr;

				let k = new Knjiga(id_knjige, naziv_knjige, izdanje, broj_kopija, isIznajmljena, zanr, "");

				session
				.run('match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a', 
				{nazivParam: k.naziv_knjige})
				.then(function(res){
					res.records.forEach(function(record) {
						let ime = record._fields[0].properties.ime;
						let prezime = record._fields[0].properties.prezime;
						let pisac = new Pisac(ime,prezime);
						k.pisac_knjige = pisac;
					});
				})
				.catch(function(err){
				console.log(err);
				});

				biblioteka.addBook(k);

			})

			console.log(biblioteka);

			res.render("biblioteka.ejs", {
				biblioteka: biblioteka //biblioteka ima svoj naziv i sve knjige koje ima
			})
		})
		.catch(function(err){
			console.log(err);
		});

});

app.get('/biblioteka/iznajmi', function(req, res){ //biblioteka/iznajmi?id_knjige=id

	let id_knjige = req.body.id_knjige;

	//neka logika za proveru da li je korisnik clan ove biblioteke

	session
		.run("match (k:Knjiga) where ID(k) = {idParam} return k", {idParam: id_knjige})
		.then(function(result) {

			let broj_kopija = result.records[0]._fields[0].properties.broj_kopija;

			if(broj_kopija > 1) {

				session
					.run("match (k:Knjiga) where ID(k) = {idParam} " + 
							"match (n:Korisnik {username: {usernameParam}} " + 
							"merge (n)-[r:Iznajmio {datum: {datumParam}}]->(k) return r", 
							{idParam: id_knjige, usernameParam: korisnik.username_korisnika(), datumParam: new Date()})
					.then(function(result) {

						if(result.records.length != 0) {

							session
								.run("match (k:Knjiga) where ID(k) = {idParam} set k.broj_kopija = k.broj_kopija - 1", 
										{idParam: id_knjige})
								.then()
								.catch(function(err) {
									console.log(err);
								});
						}
					})
					.catch(function(err) {
						console.log(err);
					});
			}
		})
		.catch(function(err) {
			console.log(err);
		});
});

app.get('/knjiga/oceni', function(req,res) {

	//let ocena = 
});

app.listen(3000);

console.log("Server Started on Port 3000");

module.exports = app;