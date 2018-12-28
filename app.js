const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const Knjiga = require("./knjiga.js");
const Pisac = require("./pisac.js");
const Biblioteka = require("./biblioteka.js");
const Korisnik = require("./Korisnik.js");
const _ = require("underscore");

const app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const driver = neo4j.driver('bolt://localhost:11001', neo4j.auth.basic('comi', 'comi'));
const session = driver.session();

//let status = 'niste ulogovani';
let status = false;
let arrray = [];
let kriterijum = '';
let username;
let password;
let korisnik;


app.get('/', function(req, res){

	res.render('index', {
		status: status,
		knjige: arrray,
		kriterijum: kriterijum
	});
});

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
					let sifra = record._fields[0].properties.sifra;
					knjige.push(new Knjiga(id, naziv, sifra, "", ""));
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

app.post('/login', function(req, res) {

	username = req.body.username;
	password = req.body.password;

	session
		.run('match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n', 
		{usernameParam:username, passwordParam:password})
		.then(function(result){
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

				status = true;
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
});

app.post('/search', function(req, res) {

	kriterijum = req.body.kriterijum;
	let value = req.body.value;
	arrray = [];

	if(kriterijum === 'knjige') {

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

app.get('/knjiga', function(req, res) { // knjiga?naziv=Crvenkapa
	
	let naziv = req.query.naziv;
	//console.log(naziv);
	let knjige = [];
	let pisac;
	session
		.run('match(n:Knjiga {naziv: {knjigaParam}}) return n', 
		{knjigaParam: naziv})
		.then(function (result){
			
			result.records.forEach(function(record){
				let k;
				let id_knjige = record._fields[0].identity.low;
				let naziv_knjige = record._fields[0].properties.naziv;
				let	sifra_knjige = record._fields[0].properties.sifra;
				let isIznajmljena = record._fields[0].properties.iznajmljena;
				k = new Knjiga(id_knjige, naziv_knjige, sifra_knjige, isIznajmljena, "");
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
									let biblioteka = new Biblioteka(imeBibl);
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

app.get('/profile', function(req, res) { 

	session
		.run("match (n:Korisnik {username: {usernameParam}, password: {passwordParam}})-[r:Iznajmio]-(k:Knjiga) return k, r", 
		 {usernameParam: korisnik.username_korisnika,
		 passwordParam: korisnik.password_korisnika})
	
		.then(function(result) {
			result.records.forEach(function(record){

				let id = record._fields[0].identity.low;
				let naziv_knjige = record._fields[0].properties.naziv;
				let sifra = record._fields[0].properties.sifra;
				let datum_iznajmljivanja = record._fields[1].properties.datum;

				let knjiga = new Knjiga(id, naziv_knjige, sifra, "da", datum_iznajmljivanja);
				
				session
					.run("match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a", 
					{nazivParam: naziv_knjige})
					.then(function(result){
						let imePisca = result.records[0]._fields[0].properties.ime;
						let prezimePisca = result.records[0]._fields[0].properties.prezime;
						let pisac = new Pisac(imePisca, prezimePisca);
						knjiga.pisac_knjige = pisac;
					})
					.catch(function(err){
						console.log(err);
					})
				korisnik.addBook(knjiga);
			})

			
		})
		.catch(function(error){
			console.log(error);
		});

	session
		.run("match (a:Korisnik {username: {usernameParam}})-[r:Prati]->(b:Korisnik) return b", 
		{usernameParam: korisnik.username_korisnika})
		.then(function (result) {
			result.records.forEach(function(record){
				let ime_followee = record._fields[0].properties.ime;
				let prezime_followee = record._fields[0].properties.prezime;
				let username_followee = record._fields[0].properties.username;
				let followee = new Korisnik(ime_followee,prezime_followee, username_followee, "");
				korisnik.addFollowee(followee);
			})
			console.log(followee);
		})	
		.catch(function(err) {
			console.log(err);
		})
	session
		.run("match (a:Korisnik)-[r:Prati]->(b:Korisnik {username: {usernameParam}}) return a", 
		{usernameParam: korisnik.username_korisnika})
		.then(function (result) {
			result.records.forEach(function(record){
				let ime_follower = record._fields[0].properties.ime;
				let prezime_follower = record._fields[0].properties.prezime;
				let username_follower = record._fields[0].properties.username;
				let follower = new Korisnik(ime_follower,prezime_follower, username_follower, "");
				korisnik.addFollowee(follower);
			})
			console.log(follower);
		})	
		.catch(function(err) {
			console.log(err);
		})

	res.render('profile.ejs', { 
			korisnik: korisnik, //korisnik ima i username, pw, ime, prez, 
			//sve knjige koje je iznajmio(naziv, datum_iznajmljivanja, pisac) i sve svoje prijatelje
	});

});

app.get('/biblioteka',function(res,req) { //biblioteka?imeBiblioteke=asdas

	let imeBiblioteke = res.query.imeBiblioteke;

	let biblioteka = new Biblioteka(imeBiblioteke);

	session
		.run("match (n:Biblioteka {ime: {imeParam}})-[r:Ima]-(k:Knjiga) return k", {imeParam: imeBiblioteke})
		.then(function(result){
			result.records.forEach(function(record){
				let id_knjige = record._fields[0].identity.low;
				let naziv_knjige = record._fields[0].properties.naziv;
				let sifra_knjige = record._fields[0].properties.sifra;
				let isIznajmljena = record._fields[0].properties.iznajmljena;
				let k = new Knjiga(id_knjige, naziv_knjige, sifra_knjige, isIznajmljena, "");

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

			res.render("biblioteka.ejs", {
				biblioteka: biblioteka //biblioteka ima svoj naziv i sve knjige koje ima
			})
		})
		.catch(function(err){
			console.log(err);
		});

});

app.listen(3000);

console.log("Server Started on Port 3000");

module.exports = app;
