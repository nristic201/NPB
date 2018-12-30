class BookFullView  {
    
    constructor(id, naziv, pisac, izdanje, ocena) {
        this._biblioteke = [];
        this._id = id;
        this._naziv = naziv;
        this._pisac = pisac;
        this._izdanje = izdanje;
        this._ocena = ocena;
    }

    set biblioteke(bibl) {
        this._biblioteke = bibl;
    }
    get biblioteke() {
        return this._biblioteke;
    }
    addBiblioteka(bibl) {
        this._biblioteke.push(bibl);
    }
}