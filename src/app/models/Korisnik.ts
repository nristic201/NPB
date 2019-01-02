import { Knjiga } from './Knjiga';

export interface Korisnik 
{   
    ime:string,
    prezime:string,
    username:string,
    password:string,
    prijatelji:Korisnik[],
    iznajmljene_knjige:Knjiga[],
}
//     constructor(ime:string=null, prezime:string=null, un:string=null, pw:string=null) {
//         this.ime = ime;
//         this.prezime = prezime;
//         this.username = un;
//         this.password = pw;
//         this.prijatelji = [];
//         this.iznajmljene_knjige = [];
//     }
//     get ime_korisnika():string {
//         return this.ime;
//     }
//     get prezime_korisnika():string {
//         return this.prezime;
//     }
//     get username_korisnika():string {
//         return this.username;
//     }
//     get password_korisnika():string {
//         return this.password;
//     }
//     set prijatelji_korisnika(prijatelji:Korisnik[]) {
//         this.prijatelji = prijatelji;
//     }
//     get prijatelji_korisnika():Korisnik[] {
//         return this.prijatelji;
//     }
//     addFriend(prijatelj:Korisnik) {
//         this.prijatelji.push(prijatelj);
//     }  
//     set knjige_korisnika(knjige:Knjiga[]) {
//         this.iznajmljene_knjige = knjige;
//     }
//     get knjige_korisnika():Knjiga[] {
//         return this.iznajmljene_knjige;
//     }
//     addBook(knjiga) {
//         this.iznajmljene_knjige.push(knjiga);
//     }
// }