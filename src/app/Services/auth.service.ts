import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Korisnik } from "../models/Korisnik";
import { Observable, BehaviorSubject } from "rxjs";
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public isLogged: boolean=false;
  public user :Korisnik=null;
  public error_msg: string;

  login(username: string, password: string): void {
    this.http
      .post("http://localhost:3000/api/login", {
        username: username,
        password: password
      })
      .subscribe(res => {
        if (res["error"] === undefined) {
          this.user=res as Korisnik;
          this.isLogged = true;
          console.log(this.user)
        }
        else {
          this.error_msg=res['error'];
        }
      });
  }
  logout() {
    this.isLogged = false;
    this.user=null;
  }
}
