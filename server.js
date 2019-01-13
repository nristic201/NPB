const express = require("express");
const path = require("path");
const cors = require('cors')
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver").v1;
const parser = require("parse-neo4j");
const redis = require('redis')
// Get our API routes

let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to redis')
})
const app = express();
app.use(cors())
// Parsers for POST data
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(express.static(path.join(__dirname, "dist/NBP")));

const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "0000")
);
const session = driver.session();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/NBP/index.html"));
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    session
        .run(
            "match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n", {
                usernameParam: username,
                passwordParam: password
            }
        )
        .then(parser.parse)
        .then(parsed => {
            if (parsed.length === 0) {
                res.json({
                    error: "invalid data"
                });
            } else {
                res.json(parsed[0]);
            }
            session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.get("/fetchbooks", (req, res) => {

    session
        .run("match (k:Knjiga) return k")
        .then(parser.parse)
        .then(parsed => {
            res.status(200).json(parsed);
        });
});

app.get("/profile/:username", function (req, res) {

    let username = req.params.username;
    let obj = {};
    session.run("match (k:Korisnik {username :{usernameParam} }) return k", {
            usernameParam: username
        })
        .then(parser.parse)
        .then(res2 => {
            obj = res2[0]
            console.log('1')
            session
                .run(
                    "match (n:Korisnik {username: {usernameParam}})-[r:Iznajmio]-(k:Knjiga) return k;", {
                        usernameParam: username
                    }
                )
                .then(parser.parse)
                .then(result => {
                    console.log('2')
                    obj = { ...obj,
                        iznajmljene_knjige: result
                    };
                    client.smembers(obj.username + ":prijatelji", (err, reply) => {
                        if (reply.length > 0) {
                            obj = { ...obj,
                                prijatelji: reply
                            };
                        } else {
                            session
                                .run("match (a:Korisnik {username: {usernameParam}})-[r:Prati]->(b:Korisnik) return b.username as username, b.ime as ime ,b.prezime as prezime", {
                                    usernameParam: username
                                })
                                .then(parser.parse)
                                .then(res1 => {
                                    console.log('3')
                                    obj = { ...obj,
                                        prijatelji: res1
                                    };
                                    res1.forEach(element => {
                                        client.sadd(obj.username + ":prijatelji", element.username)
                                    });
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })


                        }
                        res.json(obj)
                    })

                })
        })
        .catch(function (error) {
            console.log("no user with that username ...");
        });
    session.close();

});


app.get("/book/:naziv", function (req, res) {

    let naziv = req.params.naziv;
    let obj = {}
    session
        .run('match(n:Knjiga {naziv: {knjigaParam}}) return n', {
            knjigaParam: naziv
        })
        .then(parser.parse)
        .then(function (result) {
            obj = result[0]
            //U BAZI NE BI TREBALO DA POSSTOJ3 DVE KNJJIGE SA ISTIM IMENOM
            //KAD PROMENIS BAZU OBBRISI [0]
            session
                .run('match (b:Knjiga {naziv:{nazivParam}})-[r:Napisao]-(a) return a', {
                    nazivParam: naziv
                })
                .then(parser.parse)
                .then(function (results2) {
                    obj = { ...obj,
                        pisac :results2
                    }
                    session
                        .run('match (b:Biblioteka)-[r:Ima]-(k:Knjiga {naziv: {nazivParam}}) return b', {
                            nazivParam: obj.naziv
                        })
                        .then(parser.parse)
                        .then(function (result3) {
                            obj = { ...obj,
                                biblioteke: result3
                            }
                            res.json(obj)
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                })
                .catch(function (err) {
                    console.log(err);
                });
        })
        .catch(function (error) {
            console.log(error);
        })
    session.close();
});


app.post('/register', function (req, res) {
    let obj = req.body.korisnik

    session.run("match (n:Korisnik {username: {k_username}}) return n ;", {
            k_username: obj.username
        })
        .then(parsed.parse())
        .then(result => {
            if (result.length > 0) {
                res.json({
                    msg: "username je vec zauzet , unesite drugi "
                });
            }
            session
                .run("create (n:Korisnik {ime: {imeParam}, prezime: {prezimeParam}, username: {usernameParam}, password: {passwordParam} } ) return n")
                .then(parsed.parse())
                .then(results => {
                    res.json({
                        msg: 'registracija uspesna '
                    });
                })
        })
        .catch(function (err) {
            console.log("Neuspesna registracija");
        })
});

app.get('/subscribe', function (req, res) { //addFolloweeeeeeeeeeeeeee?username=NekiUsername
    let myUsername = req.query.username;
    let subscribe_to = res.query.subscribe_to
    session
        .run(`match (a:Korisnik {username: {${myUsername}}}), (b:Korisnik {username: {%${subscribe_to}}}) merge (a)-[r:Prati]->(b) return r, b`)
        .then(parser.parse)
        .then(function (result) {
            console.log(result);
        })
        .catch(function (err) {
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

app.post("/search", function (req, res) {
    let value = req.body.value;
    let obj = {
        knjige: [],
        pisci: [],
        korisnici: [],
        biblioteke: []
    }

    session
        .run("match(n:Knjiga) where n.naziv =~ {nazivParam} return n", {
            nazivParam: ".*(?i)" + value + ".*"
        })
        .then(parser.parse)
        .then(result1 => {
            obj.knjige = result1
            session.close();

            session
                .run(`match (n:Korisnik) where n.ime=~ '.*(?i)${value}.*' or n.prezime=~'.*(?i)${value}.*' return n`)
                .then(parser.parse)
                .then(result2 => {
                    obj.korisnici = result2
                    session.close();

                    session
                        .run(`match (n:Pisac) where n.ime=~ '.*(?i)${value}.*' or n.prezime=~'.*(?i)${value}.*' return n`)
                        .then(parser.parse)
                        .then(result3 => {
                            obj.pisci = result3
                            session.close();
                            res.json(obj);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
});
// } else if (kriterijum === 'pisci') {

//   session
//     .run('match(n:Biblioteka) where n.ime =~ {biblParam} return n', {
//       biblParam: '.*' + value + '.*'
//     })
//     .then(function (result) {

//       result.records.forEach(function (record) {
//         arrray.push({
//           id: record._fields[0].identity.low,
//           ime: record._fields[0].properties.ime
//         });
//       });
//       res.render('index', {
//         status: status,
//         array: arrray,
//         kriterijum: kriterijum
//       });

//       session.close();
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }
// }
//);
const port = process.env.PORT || "3000";
app.listen(port, () => {
    console.log("pokrenuto");


});