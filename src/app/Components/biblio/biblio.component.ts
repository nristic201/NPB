import { Component, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/Services/auth/auth.service";
import { api_url } from "src/assets/constants";

import { BibliotekaService } from 'src/app/Services/biblioteka/biblioteka.service';
@Component({
  selector: "app-biblio",
  templateUrl: "./biblio.component.html",
  styleUrls: ["./biblio.component.css"]
})
export class BiblioComponent implements OnInit {
  public news: any[] = [];
  public socket;

  public ocena;
  public biblio_data: any;

  constructor(
    private router:Router,
    private http: HttpClient,
    private auth: AuthService,
    private biblioS:BibliotekaService
  ) {
      
  }

  ngOnInit() {
    this.biblioS.data.subscribe(res=>{
      this.biblio_data=res;
    })
  }
  iznajmiKnjigu(knjiga) {
    if (this.auth.isLogged) {
      this.http
        .post(api_url + "biblioteka/iznajmi", {
          isbn: knjiga.ISBN,
          username: this.auth.user.username
        }).subscribe(()=>{
          this.biblioS.getBiblioInfo();
        })

    } else {
      alert("Ulogujte se !");
    }
  }
  oceniKnjigu(isbn){
    if (this.auth.isLogged) {
        this.biblioS.oceniKnjigu(isbn,this.auth.user.username,this.ocena)

    }
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
