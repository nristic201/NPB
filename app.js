const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const Knjiga = require("./knjiga.js");
const Pisac = require("./pisac.js");
const Biblioteka = require("./biblioteka.js");
const Korisnik = require("./Korisnik.js");

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

app.get('/pisac', function(req, res){

	session
		.run('match(n:Pisac {ime:{imeParam}}) return n', {imeParam:username})
		.then(function(result){

			if(result.records.length === 0) {
				res.render('index', {
					status: status,
					knjige: arrray,
					kriterijum: kriterijum
				});
			}
			else{
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

	//res.render('pisac');
});

app.get('/logout', function(res,req){
	status = false;
});

app.post('/login', function(req, res){

	username = req.body.username;
	password = req.body.password;

	session
		.run('match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n', {usernameParam:username, passwordParam:password})
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

app.post('/search', function(req, res){

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
	else {

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
});

app.get('/knjiga', function(req, res) {
	
	let naziv = req.query.naziv;
	//console.log(naziv);
	let knjige = [];
	let pisac;
	session
		.run('match(n:Knjiga {naziv: {knjigaParam}}) return n', {knjigaParam: naziv})
		.then(function (result){
			
			result.records.forEach(function(record){
				let k = new Knjiga();
				k.id_knjige = record._fields[0].identity.low;
				k.naziv_knjige = record._fields[0].properties.naziv;
				k.sifra_knjige = record._fields[0].properties.sifra;
				k.isIznajmljena = record._fields[0].properties.iznajmljena;
				knjige.push(k);

			});
			
			session
				.run('match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a', {nazivParam: naziv})
				.then(function(res){
					res.records.forEach(function(record) {
						let ime = record._fields[0].properties.ime;
						let prezime = record._fields[0].properties.prezime;
						pisac = new Pisac(ime,prezime);
					});
					
					knjige.forEach(function(knjiga){
						knjiga.pisac_knjige = pisac;
						session
							.run('match (b:Biblioteka)-[r:Ima]-(k:Knjiga {naziv: {nazivParam}}) return b', {nazivParam: knjiga.naziv_knjige})
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

	let korisnikoveKnjige = [];
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

				let knjiga = new Knjiga(id, naziv_knjige, sifra, "da");
				session
					.run("match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a", {nazivParam: naziv_knjige})
					.then(function(result){
						let imePisca = result.records[0]._fields[0].properties.ime;
						let prezimePisca = result.records[0]._fields[0].properties.prezime;
						let pisac = new Pisac(imePisca, prezimePisca);
						knjiga.pisac_knjige = pisac;
					})
					.catch(function(err){
						console.log(err);
					})
				
				korisnikoveKnjige.push(knjiga);
				console.log(knjiga);

			})
			
		})
		.catch(function(error){
			console.log(error);
		});

	res.render('profile.ejs', { //--------------treba da se doda i datum iznajmljivanja !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
			status: status,
			korisnikoveKnjigeArr: korisnikoveKnjige,

	});

});

app.listen(3000);
console.log("Server Started on Port 3000");

module.exports = app;
