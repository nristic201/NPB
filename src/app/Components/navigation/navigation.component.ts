import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/Services/auth/auth.service";
import { SendIsbnService } from "src/app/Services/send-isbn.service";
import { map } from "rxjs/operators";
import { Socket } from "ngx-socket-io";
@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.css"]
})
export class NavigationComponent implements OnInit {
  public messages = [];
  constructor(
    public router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
  }
  goHome() {
    console.log("lele");
    this.router.navigateByUrl("/home");
  }
  loadProfile() {
    this.router.navigate(["/profile/", this.authService.user.username]);
  }
  logout() {
    this.authService.logout();
  }
}
