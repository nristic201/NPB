class Knjiga {

    constructor(id, naziv, sifra, iznajmljena, datum_izn) {
        this.id = id;
        this.naziv = naziv;
        this.sifra = sifra;
        this.iznajmljena = iznajmljena;

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

}
module.exports = Knjiga;