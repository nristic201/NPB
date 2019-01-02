import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { SearchService } from 'src/app/Services/search.service';
import { AuthService } from 'src/app/Services/auth.service';



@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  @ViewChild("sidenav") public sidenav: MatSidenav;

  constructor(public router: Router,
    private authService:AuthService) {}

  ngOnInit() {}
    
  
  public open() {
    return this.sidenav.open();
  }
  public close() {
    return this.sidenav.close();
  }
}
