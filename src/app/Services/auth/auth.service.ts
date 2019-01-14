import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Korisnik } from "../../models/Korisnik";

import { api_url } from 'src/assets/constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private http: HttpClient,private router:Router) {}

  public isLogged: boolean=false;
  public user :Korisnik=null;
  public error_msg: string;

  login(username: string, password: string): void {
    this.http
      .post(api_url+"login", {
        username: username,
        password: password
      })
      .subscribe(res => {
        if (res["error"] === undefined) {
          this.user=res as Korisnik;
          this.isLogged = true;
          console.log(this.user)
          this.router.navigateByUrl('/home')
        }
        else {
          this.error_msg=res['error'];
        }
      });
  }
  logout() {
    this.isLogged = false;
    this.user=null;
    this.router.navigateByUrl('/home')
  }
}
