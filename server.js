const express = require("express");
const path = require("path");
const cors = require('cors')
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver").v1;
const parser = require("parse-neo4j");
// Get our API routes

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
    session.run("match (k:Korisnik {username :{usernameParam} }) return k",{
        usernameParam:username
    })
        .then(parser.parse)
        .then(res2 => {
            obj= res2[0]
            session
                // .run("match (n:Korisnik {username: {usernameParam}})-[r:Iznajmio]-(k:Knjiga) return k, r", {
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
                    session
                        .run("match (a:Korisnik {username: {usernameParam}})-[r:Prati]->(b:Korisnik) return b.username as username,b.ime as ime ,b.prezime as prezime", {
                            usernameParam: username
                        })
                        .then(parser.parse)
                        .then(res1 => {
                            obj = { ...obj,
                                prijatelji: res1
                            };
                        
                            res.json(obj)
                        })
                        .catch(function (err) {
                            console.log(err);
                        })
                })
        })
        .catch(function (error) {
            console.log("no user with that username ...");
        });
    session.close();

});

app.post("/search", function (req, res) {
    let criteria = req.body.criteria;
    let value = req.body.value;

    if (criteria === "Knjiga") {
        session
            .run("match(n:Knjiga) where n.naziv =~ {nazivParam} return n", {
                nazivParam: ".*(?i)" + value + ".*"
            })
            .then(parser.parse)
            .then(result => {
                res.json(result);

                session.close();
            })
            .catch(function (error) {
                console.log(error);
            });
    }
});
// } else if (kriterijum === 'pisci') {

//   session
//     .run('match(n:Pisac) where n.ime =~ {pisacParam} or n.prezime =~ {pisacParam} return n', {
//       pisacParam: '.*' + value + '.*'
//     })
//     .then(function (result) {

//       result.records.forEach(function (record) {
//         arrray.push({
//           id: record._fields[0].identity.low,
//           ime: record._fields[0].properties.ime,
//           prezime: record._fields[0].properties.prezime
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
// } else {

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