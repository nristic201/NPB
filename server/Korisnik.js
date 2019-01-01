class Korisnik 
{
    constructor(ime, prezime, un, pw) {
        this.ime = ime;
        this.prezime = prezime;
        this.username = un;
        this.password = pw;
        this.prijatelji = [];
        this.iznajmljene_knjige = [];
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
    set prijatelji_korisnika(prijatelji) {
        this.prijatelji = prijatelji;
    }
    get prijatelji_korisnika() {
        return this.prijatelji;
    }
    addFriend(prijatelj) {
        this.prijatelji.push(prijatelj);
    }  
    set knjige_korisnika(knjige) {
        this.iznajmljene_knjige = knjige;
    }
    get knjige_korisnika() {
        return this.iznajmljene_knjige;
    }
    addBook(knjiga) {
        this.iznajmljene_knjige.push(knjiga);
    }
}
module.exports = Korisnik;