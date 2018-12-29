class Knjiga {

    constructor(id, naziv, izdanje, broj_kopija, iznajmljena, zanr, datum_izn) {
        this.id = id;
        this.naziv = naziv;
        this.iznajmljena = iznajmljena;
        this.zanr = zanr;
        this.izdanje = izdanje;
        this.broj_kopija = broj_kopija;

        if(this.iznajmljena.localeCompare("da") == 0)
            this.datum_iznajmljivanja = datum_izn;
    }
    set naziv_knjige(naz) {
        this.naziv = naz;
    }
    get naziv_knjige() {
        return this.naziv;
    }
    set sifra_knjige(s) {
        this.sifra = s;
    }
    get sifra_knjige() {
        return this.s;
    }
    set id_knjige(id_knjige) {
        this.id = id_knjige;
    }
    get id_knjige() {
        return this.id;
    }
    set isIznajmljena(i) {
        this.iznajmljena = i;
    }
    get isIznajmljena() {
        return this.iznajmljena;
    }
    set pisac_knjige(p) {
        this.pisac = p;
    }
    get pisac_knjige() {
        return this.pisac;
    }
    set biblioteka_knjige(b) {
        this.biblioteka = b;
    }
    get biblioteka_knjige() {
        return this.biblioteka;
    }
    set zanr_knjige(zanr) {
        this.zanr = zanr;
    }

    get zanr_knjige() {
        return this.zanr;
    }
    set izdanje_knjige(izdanje) {
        this.izdanje = izdanje;
    }

    get izdanje_knjige() {
        return this.izdanje;
    }
    set broj_kopija_knjige(broj_kopija) {
        this.broj_kopija = broj_kopija;
    }

    get broj_kopija_knjige() {
        return this.broj_kopija;
    }
    
}
module.exports = Knjiga;