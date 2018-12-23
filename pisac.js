class Pisac
{
    constructor(ime, prezime) {
        this.ime = ime;
        this.prezime = prezime;
        this.knjige = [];
    }
    get ime_pisca() {
        return this.ime;
    }
    get prezime_pisca() {
        return this.prezime;
    }
    set knjige_pisca(knjige) {
        this.knjige = knjige;
    }
    get knjige_pisca() {
        return this.knjige;
    }
    addBook(knjiga) {
        this.knjige.push(knjiga);
    }
}

module.exports = Pisac;