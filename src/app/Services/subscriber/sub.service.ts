import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { api_url } from "src/assets/constants";
import { Observable } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root"
})
export class SubService {
  constructor(private http: HttpClient, private toast: ToastrService) {}

  subscribeTo(username: string, sub_to: string) {
    this.http
      .get(api_url + "subscribe", {
        params: {
          username: username,
          sub_to: sub_to
        }
      })
      .subscribe(res => {
        if (res["error"]) {
          this.toast.error(res["error"]);
        } else {
          this.toast.success(res["message"]);
        }
      });
  }
  unsubscribeTo(username: string, sub_to: string) {
    this.http
      .post(api_url + "unfollow", {
        username: username,
        unsub_to: sub_to
      })
      .subscribe(res => {
        if (res["error"]) {
          this.toast.error(res["error"]);
        } else {
          this.toast.success(res["message"]);
        }
      });
  }
}
