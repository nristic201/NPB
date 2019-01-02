import { Pisac } from "./Pisac";
import { Biblioteka } from "./Biblioteka";

export interface Knjiga {
  id: number,
  broj_kopija:number,
  naziv: string,
  zanr: string,
  ocena:number,
  iznajmljena: string,
  izdanje:string
}

// export class Knjiga {
//     private id:number=0;
//     private naziv:string='';
//     private sifra:string='';
//     private iznajmljena:string='';
//     private zanr:string='';
//     private datum_iznajmljivanja:Date;
//     private pisac:Pisac;
//     private biblioteka:Biblioteka;

//     constructor(id:number, naziv:string, sifra:string, iznajmljena:string, datum_izn:Date) {
//         this.id = id;
//         this.naziv = naziv;
//         this.sifra = sifra;
//         this.iznajmljena = iznajmljena;

//         if(this.iznajmljena.localeCompare("da") == 0)
//             this.datum_iznajmljivanja = datum_izn;
//     }
//     set naziv_knjige(naz:string) {
//         this.naziv = naz;
//     }
//     get naziv_knjige():string {
//         return this.naziv;
//     }
//     set sifra_knjige(s:string) {
//         this.sifra = s;
//     }
//     get sifra_knjige():string {
//         return this.sifra;
//     }
//     set id_knjige(id_knjige:number) {
//         this.id = id_knjige;
//     }
//     get id_knjige():number {
//         return this.id;
//     }
//     set isIznajmljena(i:string) {
//         this.iznajmljena = i;
//     }
//     get isIznajmljena():string {
//         return this.iznajmljena;
//     }
//     set pisac_knjige(p:Pisac) {
//         this.pisac = p;
//     }
//     get pisac_knjige():Pisac {
//         return this.pisac;
//     }
//     set biblioteka_knjige(b:Biblioteka) {
//         this.biblioteka = b;
//     }
//     get biblioteka_knjige():Biblioteka {
//         return this.biblioteka;
//     }

// }
