const express = require("express");
const path = require("path");
const cors = require('cors')
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver").v1;
const parser = require("parse-neo4j");
const redis = require('redis')
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
app.set("io", io);

io.on('connection', function (client) {
    console.log('Client connected...');

    client.on('serverMsg', function (data) {
        console.log(data);
        client.emit('messages', 'hello from server')
    });
    client.emit('alo',{message:'alo bre'})
});

const port = process.env.PORT || "3000";
server.listen(port, () => {
    console.log("pokrenuto");
});


// Get our API routes

let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to redis')
})


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

app.get('/mygenresbooks', (req, res) => {
    let knjigeMojiZanrovi = []
    let promises = []
    getMyGenres('comi')
        .then(zanrovi => {
            zanrovi.forEach(zanr => {
                promises.push(
                    getBooksByGenre(zanr)
                    .then(books => {
                        knjigeMojiZanrovi.push.apply(knjigeMojiZanrovi, books);
                    })
                    .catch(err => console.log(err))
                )
            })
            Promise.all(promises).then(
                () => {
                    res.json(knjigeMojiZanrovi)
                }
            )
        })
})
app.get("/friendsbooks", (req, res) => {
    let knjigePrijatelja = []
    let promises = [];
    getFollowees('comi')
        .then(prijatelji => {
            prijatelji.forEach(prijatelj => {
                promises.push(
                    getFolloweeBooks(prijatelj.username)
                    .then(friendsBooks => {
                        knjigePrijatelja.push.apply(knjigePrijatelja, friendsBooks);
                    })
                    .catch(err => {
                        console.log(err);
                    })
                )
            })
            Promise.all(promises).then(
                () => {
                    res.json(knjigePrijatelja)
                }
            )
        })
})
app.get('/fetchbooks', (req, res) => {
    session
        .run("match (k:Knjiga)<-[o:Ocenio]-(p:Korisnik) return k, o")
        .then(parser.parse)
        .then(parsed => {
            let obj = parsed.map(el =>
                el = { ...el['k'],
                    ...el['o']
                }
            )
            res.status(200).json(obj);
        });

})

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
                        session
                            .run("match (a:Korisnik {username: {usernameParam}})-[r:Prati]->(b:Korisnik) return b.username as username, b.ime as ime ,b.prezime as prezime", {
                                usernameParam: username
                            })
                            .then(parser.parse)
                            .then(res1 => {
                                obj = { ...obj,
                                    prijatelji: res1
                                };
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
                                biblioteka: result3[0]
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

    console.log(req.query)
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
    session
        .run("match (n:Biblioteka)-[r:Ima]-(k:Knjiga) return k")
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
        korisnici: []
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
app.get('/subscribe', function (req, res) {
    let myUsername = req.query.username;
    let subscribe_to = req.query.sub_to

    session
        .run(`match (a:Korisnik {username: '${myUsername}'}), (b:Korisnik {username: '${subscribe_to}'}) merge (a)-[r:Prati]->(b) return b`)
        .then(parser.parse)
        .then(function (result) {
            res.json({
                message: `Uspesno ste zapratiti ${subscribe_to}`
            })
        })
        .catch(function (err) {
            console.log(err);
        })
});

function getBooksByGenre(zanr) {
    return new Promise((resolve, reject) => {
        client.smembers(zanr + ":knjige", (err, reply) => {
            if (reply.length === 0) {
                session
                    .run("match (k:Knjiga)-[p:Pripada]->(z:Zanr {zanr:{zanrParam}}) return k", {
                        zanrParam: zanr
                    })
                    .then(parser.parse)
                    .then(result => {
                        result.forEach(el => {
                            client.sadd(zanr + ":knjige", JSON.stringify(el));
                        });
                        resolve(result);
                    })
            } else {

                let obj = [];
                reply.forEach(el => {
                    obj.push(JSON.parse(el))
                })
                resolve(obj);
            }
        })
    })
}

function getMyGenres(username) {
    let zanrovi = [];
    return new Promise((resolve, reject) => {
        client.smembers(username + ":zanrovi", (err, reply) => {
            if (reply.length === 0) {
                session
                    .run("match (z:Zanr)-[:Pripada]-(k:Knjiga)<-[o:Ocenio]-(n:Korisnik {username: {unParam}}) return z", {
                        unParam: username
                    })
                    .then(parser.parse)
                    .then(result => {
                        result.forEach(record => {
                            client.sadd(username + ":zanrovi", JSON.stringify(record.zanr));
                            zanrovi.push(record.zanr);
                        })
                        resolve(zanrovi);
                    })
                    .catch(err => console.log(err))
            } else {

                let obj = [];
                reply.forEach(el => {
                    obj.push(JSON.parse(el))
                })
                resolve(obj);
            }
        })
    })
}

function getFollowees(username) {
    let prijatelji = [];
    return new Promise(function (resolve, reject) {
        client.smembers(username + ":followees", function (err, reply) {
            if (reply) {
                session
                    .run("match (a:Korisnik {username: {usernameParam}})-[p:Prati]->(b:Korisnik) return b", {
                        usernameParam: username
                    })
                    .then(parser.parse)
                    .then(function (result) {
                        result.forEach(el => {
                            client.sadd(username + ":followees", JSON.stringify(el))
                        })
                        resolve(result);
                    })
                    .catch(function (err) {
                        reject(err);
                        console.log(err);
                    });
            } else {
                let obj = [];
                reply.forEach(el => {
                    obj.push(JSON.parse(el))
                })
                resolve(obj);
            }
        });
    })
};

function getFolloweeBooks(prijatelj) {
    return new Promise(function (resolve, reject) {
        client.smembers(prijatelj + ":knjige", function (error, reply) {
            if (reply.length === 0) {
                session
                    .run("match(k:Korisnik {username: {unParam}})-[r:Ocenio]->(a:Knjiga)<-[n:Napisao]-(p:Pisac) return a,k", {
                        unParam: prijatelj
                    })
                    .then(parser.parse)
                    .then(function (result) {
                        knjige = []
                        result.forEach(el => {
                            let p = { ...el['a'],
                                ...el['k']
                            }
                            knjige.push(p)
                            client.sadd(prijatelj + ":knjige", JSON.stringify(p));
                        });

                        resolve(knjige);
                    })
                    .catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
            } else {

                let obj = [];
                reply.forEach(el => {
                    obj.push(JSON.parse(el))
                })
                resolve(obj);
            }
        });
    })

}

function getBooksByOcena() {
    let knjige = [];
    client.smembers("najbolje_knjige", function (err, reply) {
        if (reply.length === 0) {

            session
                .run("match (n:Knjiga)<-[r:Napisao]-(p:Pisac) return n,p order by n.ocena DESC limit 20")
                .then(function (result) {
                    result.records.forEach(record => {
                        let naziv = record._fields[0].properties.naziv;
                        let izdanje = record._fields[0].properties.izdanje;
                        let ocena = record._fields[0].properties.ocena;
                        let pisacIme = record._fields[1].properties.ime;
                        let pisacPrezime = record._fields[1].properties.prezime;

                        client.sadd("najbolje_knjige", naziv + "*" + izdanje + "*" + ocena + "*" + pisacIme + "*" + pisacPrezime);

                        let knjiga = new BookBasicView(naziv, pisacIme + " " + pisacPrezime, izdanje, ocena);


                        knjige.push(knjiga);
                    })
                })
                .catch(err => console.log(err));
        } else {
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


app.post('/biblioteka/iznajmi', function (req, res) { //biblioteka/iznajmi
    var io = req.app.get('io');
    let isbn = req.body.isbn;
    let username = req.body.username;

    // getUsersLibraries(korisnik.username_korisnika)
    //     .then(biblioteke => {
    //         biblioteke.forEach(bibl => {
    //             if (bibl.ime_bibl === naziv_biblioteke && bibl.grad_biblioteke === grad) {
    //                 clan = true;
    //             }
    //         })
    //         if (clan) {
    session
        .run("match (k:Knjiga {ISBN: {isbnParam}}) return k", {
            isbnParam: isbn
        })
        .then(parser.parse)
        .then(function (result) {
            if (result[0].broj_kopija > 0) {
                session
                    .run("match (k:Knjiga {ISBN : {idParam}}) " +
                        "match (n:Korisnik {username: {usernameParam}}) " +
                        "merge (n)-[r:Iznajmio {datum: {datumParam}}]->(k) return r", {
                            idParam: isbn,
                            usernameParam: username,
                            datumParam: new Date().toISOString()
                        })
                    .then(parser.parse)
                    .then(function (result) {
                        if (result[0]) {
                            session
                                .run("match (k:Knjiga) where k.ISBN = {idParam} set k.broj_kopija = k.broj_kopija - 1", {
                                    idParam: isbn
                                })
                                .then(result => {
                                    if (result.records) {
                                        io.emit('alo',{message:'alo bre'})
                                        res.json({
                                            message: "Uspesno iznajmljena knjiga"
                                        })
                                    } else
                                        res.json({
                                            message: "Neuspesno iznajmljena knjiga"
                                        })
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
                    .run("match (k:Knjiga) where k.ISBN = {idParam} " +
                        "match (n:Korisnik {username: {usernameParam}}) merge (n)-[z:Zeli]->(k) return  k", {
                            idParam: isbn,
                            usernameParam: username
                        })
                    .then(parser.parse)
                    .then(result => {
                        if (result.length != 0) {
                            let naziv_knjige = result.naziv;
                            let izdanje = result.izdanje;
                            //---------------OVDE SOKETI
                            client.subscribe(isbn, (err, count) => {
                                if (err)
                                    res.json({
                                        message: "Try again."
                                    })

                                else {
                                    res.json({
                                        isbn:isbn,
                                        message: "Uspesno sub za knjigu"
                                    })
                                }
                            });
                            client.on('message', function (channel, message) {

                                io.emit('alo','de si bre');
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
});

app.post('/biblioteka/oslobodi', function (req, res) { //biblioteka/iznajmi?id_knjige=id&naziv=nazivBibl&grad=grad
 
    let isbn = req.body.isbn;
    let username = req.body.username;

    session
        .run("match (a:Knjiga) where ISBN = {idParam} match (k:Korisnik  {username: {unParam}}) where (k)-[o:Iznajmio]->(a) delete o", {
            idParam: isbn,
            unParam: username
        })
        .then(result => {
            if (result != null) {
                session
                    .run("match (k:Knjiga) where ISBN = {idParam} set k.broj_kopija = k.broj_kopija + 1", {
                        idParam: isbn
                    })
                    .then(result => {
                        //----------------------------------------------
                        client.publish(isbn, "Knjiga slobodna");
                        //----------------------------------------------
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        })
        .catch(err => console.log(err));
});