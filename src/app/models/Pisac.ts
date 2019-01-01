import { Knjiga } from './Knjiga';

export class Pisac
{
    private ime:string;
    private prezime:string;
    private knjige:Knjiga[]=[];
    constructor(ime:string, prezime:string) {
        this.ime = ime;
        this.prezime = prezime;
        this.knjige = [];
    }
    get ime_pisca() {
        return this.ime;
    }
    get prezime_pisca() {
        return this.prezime;
    }
    set knjige_pisca(knjige) {
        this.knjige = knjige;
    }
    get knjige_pisca() {
        return this.knjige;
    }
    addBook(knjiga) {
        this.knjige.push(knjiga);
    }
}
