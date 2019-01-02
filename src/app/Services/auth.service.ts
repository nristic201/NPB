import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Korisnik } from "../models/Korisnik";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username:string, password:string) {
    console.log(username,password)
    return this.http
      .post("http://localhost:3000/login", {
        username: username,
        password: password
      }).subscribe(res => console.log("dal"));
  }
}
