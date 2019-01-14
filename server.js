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
            session
                .run(
                    "match (n:Korisnik {username: {usernameParam}})-[r:Iznajmio]-(k:Knjiga) return k;", {
                        usernameParam: username
                    }
                )
                .then(parser.parse)
                .then(result => {
                    obj = { ...obj,
                        iznajmljene_knjige: result
                    };
                    client.smembers(obj.username + ":prijatelji", (err, reply) => {
                        // if (reply.length > 0) {
                        //     obj = { ...obj,
                        //         prijatelji: reply
                        //     };
                        // } else {
                        session
                            .run("match (a:Korisnik {username: {usernameParam}})-[r:Prati]->(b:Korisnik) return b.username as username, b.ime as ime ,b.prezime as prezime", {
                                usernameParam: username
                            })
                            .then(parser.parse)
                            .then(res1 => {
                                obj = { ...obj,
                                    prijatelji: res1
                                };

                                //OVDE BI TREBALO DA SE UPISE IME PREZIME USERNAME
                                //U REDIS , JER ON TRENUTNO PAMTI SAMO USERNAME
                                res1.forEach(element => {
                                    client.sadd(obj.username + ":prijatelji", element.username)
                                });
                            })
                        //}
                        session
                            .run("match (n:Korisnik {username: {usernameParam}})-[r:Ocenio]-(k:Knjiga) return k;", {
                                usernameParam: username
                            })
                            .then(parser.parse)
                            .then(result4 => {
                                obj = {
                                    ...obj,
                                    ocenjene_knjige: result4
                                }
                                res.json(obj)
                            })
                            .catch(function (err) {
                                console.log(err);
                            })
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
                        pisac: results2
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


app.get('/pisac', function (req, res) { //  /pisac?imePisca=Kristijan&prezimePisca=Andersen

    console.log(req.query )
    let imePisca = req.query.ime;
    let prezimePisca = req.query.prezime;
    let obj = {
        ime: imePisca,
        prezime: prezimePisca
    }
    session
        .run(`match (n:Pisac {ime:'${imePisca}', prezime: '${prezimePisca}'})-[r:Napisao]-(b:Knjiga) return b`)
        .then(parser.parse)
        .then(function (result) {
            // let filter_knjige = _.uniq(result, function (p) {
            //     return p.naziv;
            // });
            obj = {
                ...obj,
                knjige_pisca: result
            }

            //filter_knjige sadrze knjige koje je pisac napisao
            //samo bez ponavljanja
            //jer se pisac vezuje za vise istih knjiga sa razlicitim siframa

            res.json(obj)
            session.close();
        })
        .catch(function (error) {
            console.log(error);
        });

});

app.get('/biblioteka', function (req, res) { //biblioteka?imeBiblioteke=asdas

    let imeBiblioteke = req.query.ime
    console.log(req.query)
    session
      .run("match (n:Biblioteka {ime: {imeParam}})-[r:Ima]-(k:Knjiga) return k", {
        imeParam: imeBiblioteke
      })
      .then(parser.parse)
      .then(function (result) {
        res.json(result)
      })
      .catch(function (err) {
        console.log(err);
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
                            session.run(`match (n:Biblioteka) where n.ime=~ '.*(?i)${value}.*' return n`)
                            .then(parser.parse)
                            .then(result4=>{
                                obj.biblioteke=result4;
                                console.log(obj)
                                res.json(obj)
                            })
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
app.get('/subscribe', function (req, res) {
    let myUsername = req.query.username;
    let subscribe_to = req.query.sub_to
    console.log(myUsername, subscribe_to)
    session
        .run(`match (a:Korisnik {username: '${myUsername}'}), (b:Korisnik {username: '${subscribe_to}'}) merge (a)-[r:Prati]->(b) return b`)
        .then(parser.parse)
        .then(function (result) {
            console.log(result);
        })
        .catch(function (err) {
            console.log(err);
        })
});

const port = process.env.PORT || "3000";
app.listen(port, () => {
    console.log("pokrenuto");
});