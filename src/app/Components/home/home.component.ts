import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { SearchService } from 'src/app/Services/search/search.service';
import { AuthService } from 'src/app/Services/auth/auth.service';



@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
 
  constructor() {}

  ngOnInit() {}
  
}
