class BookBasicView {
    
    constructor(naziv, pisac, izdanje, ocena) {
        this._naziv = naziv;
        this._pisac = pisac;
        this._izdanje = izdanje;
        this._ocena = ocena;
    }

    set naziv(naziv) {
        this._naziv = naziv;
    }
    get naziv() {
        return this._naziv;
    }
    set pisac(pisac) {
        this._pisac = pisac;
    }
    get pisac() {
        return this._pisac;
    }
    set izdanje(izdanje) {
        this._izdanje = izdanje;
    }
    get izdanje() {
        return this._izdanje;
    }
    set ocena(ocena) {
        this._ocena = ocena;
    }
    get ocena() {
        return this._ocena;
    }
}
module.exports = BookBasicView;