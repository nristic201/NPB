import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { api_url } from 'src/assets/constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private http: HttpClient,private router:Router) {}

  public isLogged: boolean=false;
  public user =null;
  public error_msg: string;

  login(username: string, password: string): void {
    this.http
      .post(api_url+"login", {
        username: username,
        password: password
      })
      .subscribe(res => {
        if (res["error"] === undefined) {
          this.user=res;
          this.isLogged = true;
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
