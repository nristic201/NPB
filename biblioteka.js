const Knjiga = require("./knjiga");

class Biblioteka
{
    constructor(ime_bibl) {
        this.ime = ime_bibl;
        this.knjige = [];
    }
    get ime_bibl() {
        return this.ime;
    }
    set knjige_biblioteke(k) {
        this.knjige.push(k);
    }
    get knjige_biblioteke() {
        return this.knjige;
    }
}
module.exports = Biblioteka;