class Korisnik 
{
    constructor(ime, prezime, un, pw) {
        this.ime = ime;
        this.prezime = prezime;
        this.username = un;
        this.password = pw;
        this.followees = [];
        this.followers = [];
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
    set followees_korisnika(followees) {
        this.followees = followees;
    }
    get followees_korisnika() {
        return this.followees;
    }
    addFollowee(followee) {
        this.followees.push(followee);
    }  
    set followers_korisnika(followers) {
        this.followers = followers;
    }
    get followers_korisnika() {
        return this.followers;
    }
    addFollower(follower) {
        this.followers.push(follower);
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