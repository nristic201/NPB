import { Knjiga } from './Knjiga';

export class Biblioteka
{
    private ime:string='';
    private knjige:Knjiga[];

    constructor(ime_bibl:string) {
        this.ime = ime_bibl;
        this.knjige = [];
    }
    get ime_bibl():string {
        return this.ime;
    }
    set knjige_biblioteke(k:Knjiga[]) {
        this.knjige
    }
    get knjige_biblioteke():Knjiga[] {
        return this.knjige;
    }
    addBook(knjiga) {
        this.knjige.push(knjiga);
    }
}
