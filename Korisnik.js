class Korisnik 
{
    constructor(ime, prezime, un, pw) {
        this.ime = ime;
        this.prezime = prezime;
        this.username = un;
        this.password = pw;
    }
    get ime_korisnika() {
        return this.ime;
    }
    get prezime_korisnika() {
        return this.prezime;
    }
    get username_korisnika() {
        return this.username;
    }
    get password_korisnika() {
        return this.password;
    }
}
module.exports = Korisnik;