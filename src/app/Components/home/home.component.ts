import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { SearchService } from "src/app/Services/search/search.service";
import { AuthService } from "src/app/Services/auth/auth.service";
import { BooksService } from "src/app/Services/books/books.service";
import { SendIsbnService } from "src/app/Services/send-isbn.service";
import { Socket } from "ngx-socket-io";
import { map } from "rxjs/operators";
import { from } from "rxjs";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public messages = [];
  public friends_books = [];
  public mygenresbooks = [];
  public best_rated = [];

  constructor(
    private bs: BooksService,
    private router: Router,
    public auth: AuthService,

  ) {
    
  }

  ngOnInit() {
    if (this.auth.isLogged) {
      this.bs.fetchFriendsBooks("comi").subscribe(res => {
        this.friends_books = res;
        console.log(res);
      });
      this.bs.fetchMyGenresBooks("comi").subscribe(res => {
        this.mygenresbooks = res;
      });
    }
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
