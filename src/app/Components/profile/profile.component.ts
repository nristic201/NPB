import { Component, OnInit } from "@angular/core";
import { ProfileService } from "../../Services/profile/profile.service";
import { Observable } from "rxjs";
import {
  ActivatedRouteSnapshot,
  ActivatedRoute,
  Router
} from "@angular/router";
import { AuthService } from "src/app/Services/auth/auth.service";
import { BooksService } from "src/app/Services/books/books.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  public user: any;
  public snapshot: any;
  constructor(
    private bs: BooksService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) {
    this.snapshot = route.snapshot;
  }

  ngOnInit() {
    this.user = this.snapshot.data["profile"];
    console.log("ovde", this.user);
  }

  vratiKnjigu(isbn) {
    if (this.auth.isLogged) {
      this.bs.oslobodiKnjigu(isbn,this.auth.user.username);
    }
  }
}
