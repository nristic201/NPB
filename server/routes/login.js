let express = require('express')
let routes = express.Router();

module.exports = (io) => {
    routes.post("/login", (req, res) => {
        console.log('dal me gadjas')
        const username = req.body.username;
        const password = req.body.password;
        io.emit('alo', 'desi bre majmune')
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
    return routes;
}
