const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
// Get our API routes

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'dist/NBP')));

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '0000'));
const session = driver.session();

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/NBP/index.html'));
});

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    session
        .run('match(n:Korisnik {username:{usernameParam}, password:{passwordParam}}) return n', {
            usernameParam: username,
            passwordParam: password
        })
        .then(function (result) {
            if (result.records.length === 0) {
                console.log('nema nista')
            } else {
                const korisnik = {
                    ime: result.records[0]._fields[0].properties.ime,
                    prezime: result.records[0]._fields[0].properties.prezime,
                    user: result.records[0]._fields[0].properties.username,
                    pw: result.records[0]._fields[0].properties.password
                }

                let status = true;
                console.log(korisnik)
                // res.send(200, {
                //     status: status,
                //     knjige: arrray,
                //     kriterijum: kriterijum
                // });
            }

            session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
});


const port = process.env.PORT || '3000';
app.listen(port, () => {
    console.log('pokrenuto')
})