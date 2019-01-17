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
import { SubService } from 'src/app/Services/subscriber/sub.service';
import { HttpClient } from '@angular/common/http';
import { api_url } from 'src/assets/constants';

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
    private ps:ProfileService,
    public auth: AuthService,
    public subS:SubService,
    private http:HttpClient

  ) {
    this.ps.data.subscribe(res=>{
      this.user=res
    })
  }

  ngOnInit() {
    this.user=this.ps.data
  }

  vratiKnjigu(isbn) {
    if (this.auth.isLogged) {
      this.bs.oslobodiKnjigu(isbn,this.auth.user.username).subscribe(res=>{
          console.log(res);
          this.http.get<any>(`${api_url}profile/${this.auth.user.username}`).subscribe(res=>{
            this.ps.updatedDataSelection(res);
          });
      })
    }
  }
  unfollow(unsub_to){
      this.subS.unsubscribeTo(this.auth.user.username,unsub_to)
  }
}
