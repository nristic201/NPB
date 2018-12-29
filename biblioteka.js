const Knjiga = require("./knjiga");

class Biblioteka
{
    constructor(ime_bibl, grad) {
        this.ime = ime_bibl;
        this.grad = grad;
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
    
    set grad_biblioteke(grad) {
        this.grad = grad;
    }
    get grad_biblioteke() {
        return this.grad;
    }
    addBook(knjiga) {
        this.knjige.push(knjiga);
    }
}
module.exports = Biblioteka;