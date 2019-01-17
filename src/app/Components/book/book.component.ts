import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BibliotekaService } from 'src/app/Services/biblioteka/biblioteka.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-book",
  templateUrl: "./book.component.html",
  styleUrls: ["./book.component.css"]
})
export class BookComponent implements OnInit {
  public book: any;
  public snapshot: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private biblioS: BibliotekaService,
    private http:HttpClient
  ) {
    this.snapshot = route.snapshot;
  }

  ngOnInit() {
    //treba da se promeni u resolveru...
    this.book = this.snapshot.data["profile"];
  }
  loadBiblioInfo() {
    this.router.navigate(["/biblioteka"]);
    this.biblioS.getBiblioInfo();
  }
  loadWritterInfo(ime,prezime){
    this.router.navigate(["/pisac"],{queryParams:{
      ime:ime,
      prezime:prezime
    }});
  }

}
