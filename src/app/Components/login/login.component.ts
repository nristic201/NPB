import { Component, OnInit } from "@angular/core";;
import { AuthService } from "src/app/Services/auth/auth.service";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  public username: string;
  public password: string;

  constructor(public authService: AuthService,private router:Router) {}

  ngOnInit() {}
  loginReq() {
    this.authService.login(this.username, this.password)
  }
}