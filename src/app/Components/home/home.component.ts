import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { AuthService } from "src/app/Services/auth/auth.service";
import { BooksService } from "src/app/Services/books/books.service";
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
      this.bs.fetchFriendsBooks(this.auth.user.username).subscribe(res => {
        this.friends_books = res;
        console.log(res);
      });
      this.bs.fetchMyGenresBooks(this.auth.user.username).subscribe(res => {
        this.mygenresbooks = res;
        console.log(res)
      });
    }
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
