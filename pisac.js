class Pisac
{
    constructor(ime, prezime) {
        this.ime = ime;
        this.prezime = prezime;
    }
    get ime_pisca() {
        return this.ime;
    }
    get prezime_pisca() {
        return this.prezime;
    }
}

module.exports = Pisac;