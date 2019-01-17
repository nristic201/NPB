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

const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "0000")
);

const session = driver.session();

const followUser = 'follow-user'
const followMe = 'follow-me'


const userarray = [];
//moze da se cuva u redisu i da se pamti svaka promena (ako padne server)

io.on('connection', sockClient => {
    console.log('konekcija')
    const queryparams = sockClient.request._query;
    const username = queryparams.username;
    console.log(queryparams)
    // pronadji sve knjige na koje treba da se subscribe
    findSubscribes(username).then(res => {
        res.forEach(book => {
            sockClient.join(book.ISBN);
        })
    })
    findMyFriends(username).then(res => {

        res.forEach(user => {
            sockClient.join(followUser + user.username)
        })
    })
    sockClient.join(followMe + username);
    userarray[username] = sockClient;
});

server.listen(3000, () => {
    console.log("pokrenuto");
});

const findSubscribes = (username) => {
    return session
        .run(`match (k:Knjiga) match (n:Korisnik {username: '${username}'}) merge (n)-[z:Zeli]->(k) return  k`)
        .then(parser.parse)

}
const findMyFriends = (username) => {
    return session
        .run(`match (k:Korisnik {username: '${username}'})-[p:Prati]->(a:Korisnik) return a`)
        .then(parser.parse)

}


// Get our API routes

let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to redis')
})

let redisSub = redis.createClient();
redisSub.on('connect', () => {
    console.log('redis za sub')
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


app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "dist/NBP/index.html"));
});

app.post('/biblioteka/oslobodi', function (req, res) {
    let isbn = req.body.isbn;
    let username = req.body.username;

    session
        .run("match (a:Knjiga {ISBN: {idParam}})<-[o:Iznajmio]-(k:Korisnik {username: {unParam}}) delete o", {
            idParam: isbn,
            unParam: username
        })
        .then(result => {
            if (result != null) {
                session
                    .run("match (k:Knjiga {ISBN:{idParam}}) set k.broj_kopija = k.broj_kopija + 1 return k", {
                        idParam: isbn
                    })
                    .then(parser.parse)
                    .then(result => {

                        io.to(isbn).emit('stigla-knjiga', `knjiga:${result[0].naziv} je ponovo na lageru`)

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        })
        .catch(err => console.log(err))
})

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

app.get('/pisac', function (req, res) { //  /pisac?imePisca=Kristijan&prezimePisca=Andersen

    let imePisca = req.query.ime;
    let prezimePisca = req.query.prezime;
    let obj = {

    }
    session
        .run(`match (n:Pisac {ime:'${imePisca}', prezime: '${prezimePisca}'})-[r:Napisao]-(b:Knjiga) return n,b`)
        .then(parser.parse)
        .then(function (result) {
            let knjige = []
            result.forEach(el => {
                knjige.push(el['b'])
            })
            obj = {
                ...result[0]['n'],
                knjige_pisca: knjige
            }



            res.json(obj)
            session.close();
        })
        .catch(function (error) {
            console.log(error);
        });

});


app.post('/biblioteka/iznajmi', function (req, res) {

    let id_knjige = req.body.isbn;
    let username = req.body.username;
    session
        .run(`match (k:Korisnik {username: '${username}'})-[z:Zeli]-(a:Knjiga {ISBN: ${id_knjige}}) return z`)
        .then(parser.parse)
        .then(result => {
            if (result) {

                session
                    .run("match (k:Knjiga) where k.ISBN = {idParam} return k", {
                        idParam: id_knjige
                    })
                    .then(function (result) {

                        let broj_kopija = result.records[0]._fields[0].properties.broj_kopija;

                        if (broj_kopija > 0) {

                            session
                                .run("match (k:Knjiga {ISBN: {idParam}}), (n:Korisnik {username: {usernameParam}}) merge (n)-[r:Iznajmio {datum: {datumParam}}]->(k) return r", {
                                    idParam: id_knjige,
                                    usernameParam: username,
                                    datumParam: new Date().toISOString()
                                })

                                .then(parser.parse)
                                .then(function (result) {

                                    if (result) {

                                        session
                                            .run("match (k:Knjiga) where k.ISBN = {idParam} set k.broj_kopija = k.broj_kopija - 1 return k", {
                                                idParam: id_knjige
                                            })
                                            .then(parser.parse)
                                            .then(result => {
                                                if (result) {
                                                    io.to(followUser + username).emit('news', `${username} iznajmio ${result[0].naziv}`)
                                                    res.json({
                                                        message: "Uspesno iznajmljena knjiga"
                                                    })
                                                } else
                                                    res.json({
                                                        error: "Niste iznajmili knjigu"
                                                    })
                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                            });
                                    }
                                })
                                .then(result => {
                                    session
                                        .run("match (k:Knjiga {ISBN: {idParam}})<-[z:Zeli]-(n:Korisnik {username: {usernameParam}}) delete z", {
                                            idParam: id_knjige,
                                            usernameParam: username
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
                    .run("match (k:Knjiga) where k.ISBN = {idParam} return k", {
                        idParam: id_knjige
                    })
                    .then(function (result) {

                        let broj_kopija = result.records[0]._fields[0].properties.broj_kopija;

                        if (broj_kopija > 0) {

                            session
                                .run("match (k:Knjiga) where k.ISBN = {idParam} " +
                                    "match (n:Korisnik {username: {usernameParam}}) " +
                                    "merge (n)-[r:Iznajmio {datum: {datumParam}}]->(k) return r", {
                                        idParam: id_knjige,
                                        usernameParam: username,
                                        datumParam: new Date()
                                    })
                                .then(parser.parse)
                                .then(function (result) {

                                    if (result) {

                                        session
                                            .run("match (k:Knjiga) where k.ISBN = {idParam} set k.broj_kopija = k.broj_kopija - 1", {
                                                idParam: id_knjige
                                            })
                                            .then(result => {
                                                if (result)
                                                    res.json({
                                                        message: "Uspesno iznajmljena knjiga"
                                                    })
                                                else
                                                    res.json({
                                                        error: "Niste iznajmili knjigu"
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
                                .run("match (k:Korisnik {username:{unParam}}), (a:Knjiga {ISBN: {idParam}}) merge (a)<-[z:Zeli]-(k) return z", {
                                    unParam: username,
                                    idParam: id_knjige
                                })
                                .then(parser.parse)
                                .then(result => {

                                    if (result) {
                                        const bookISBN = result.ISBN;
                                        if (userarray[username]) {
                                            userarray[username].join(bookISBN);
                                        }
                                        res.json({
                                            message: "Kreirana veza zeli"
                                        })
                                    } else {
                                        res.json({
                                            error: "Nije kreirana veza zeli"
                                        })
                                    }
                                })
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        })
});



app.post('/oceni', function (req, res) { //

    let isbn = req.body.isbn;
    let ocena = req.body.ocena;
    let username = req.body.username;

    let sum = 0;
    let num = 0;
    session
        .run("match (k:Knjiga {ISBN: {isbnParam}}), (n:Korisnik {username: {usernameParam}}) merge (k)<-[:Ocenio {ocena: {ocenaParam}}]-(n)", {
            isbnParam: isbn,
            usernameParam: username,
            ocenaParam: ocena
        })
        .then(result => {
            session
                .run(`match (k:Knjiga {ISBN: ${isbn}})-[o:Ocenio]-(p:Korisnik) return o`)
                .then(parser.parse)
                .then(result => {
                    result.forEach(record => {
                        sum += record.ocena;
                        num++;
                    })
                    let prosecna = sum / num;
                    session
                        .run(`match (k:Knjiga {ISBN: ${isbn}}) set k.ocena = ${prosecna} return k`)
                        .then(parser.parse)
                        .then(result => {
                            io.to(followUser + username).emit('news', `${username} ocenio ${result[0].naziv}`)

                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));

});



app.get('/biblioteka', function (req, res) { //biblioteka?imeBiblioteke=asdas

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
app.post('/unfollow', (req, res) => {
    let my_username = req.body.username;
    let username = req.body.unsub_to;
    session
        .run("match (k:Korisnik {username: {followee}})<-[p:Prati]-(a:Korisnik {username: {meParam}}) delete p", {
            meParam: my_username,
            followee: username
        })
        .then(result => {
            console.log('dal',results)
            if (result)
                if (userarray[my_username]) {
                    userarray[my_username].leave(followUser + username);
                }
            else
                console.log('neuspesno')
        })
        .catch(err => console.log(err));
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
            io.to(followMe + subscribe_to).emit('stigo-follow', `zapratio me ${result[0].ime} ${result[0].prezime}`)
            if (userarray[myUsername]) {
                userarray[myUsername].join(followUser + subscribe_to);
            }
            res.json({
                message: `Uspesno ste zapratili ${subscribe_to}`
            })
        })
        .catch(function (err) {
            console.log(err);
        })
});

app.get('/mygenresbooks', (req, res) => {
    let knjigeMojiZanrovi = []
    let promises = []
    let username = req.query.username;
    getMyGenres(username)
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
});
app.get("/friendsbooks", (req, res) => {
    let knjigePrijatelja = []
    let promises = [];
    let username = req.query.username;
    getFollowees(username)
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
        client.smembers(username + ":prijatelj", function (err, reply) {
            if (reply.length === 0) {
                session
                    .run("match (a:Korisnik {username: {usernameParam}})-[p:Prati]->(b:Korisnik) return b", {
                        usernameParam: username
                    })
                    .then(parser.parse)
                    .then(function (result) {
                        
                        result.forEach(el => {
                            client.sadd(username + ":prijatelj", JSON.stringify(el))
                            prijatelji.push(el)
                        })
                        resolve(prijatelji)
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
};