import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from '@angular/router';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  @ViewChild("sidenav") public sidenav: MatSidenav;
  constructor(
    public router:Router
  ) {}

  ngOnInit() {}
  public open() {
    return this.sidenav.open();
  }
  public close() {
    return this.sidenav.close();
  }
}
