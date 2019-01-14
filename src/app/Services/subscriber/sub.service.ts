import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { api_url } from "src/assets/constants";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SubService {
  constructor(private http: HttpClient) {}

  subscribeTo(username: string, sub_to: string) {
    this.http.get(api_url + "subscribe", {
      params: {
        username: username,
        sub_to: sub_to
      }
    }).subscribe(res=>console.log('dal',res));
  }
}
