class UserBasicView {
    constructor(ime, prezime, username) {
        this._ime = ime;
        this._prezime = prezime;
        this._username = username;
    }
    get ime() {
        return this._ime;
    }

    get prezime() {
        return this._prezime;
    }
}
module.exports = UserBasicView;