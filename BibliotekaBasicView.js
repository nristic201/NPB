class BibliotekaBasicView
{
    constructor(ime_bibl, grad) {
        this._ime = ime_bibl;
        this._grad = grad;
    }
    get ime_bibl() {
        return this.ime;
    }
    set grad_biblioteke(grad) {
        this.grad = grad;
    }
    get grad_biblioteke() {
        return this.grad;
    }
}
module.exports = BibliotekaBasicView;