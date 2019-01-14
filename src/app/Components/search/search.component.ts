import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SearchService } from "src/app/Services/search/search.service";
import { ProfileService } from "../../Services/profile/profile.service";
import { Router } from "@angular/router";
import { AuthService } from 'src/app/Services/auth/auth.service';
import { SubService } from 'src/app/Services/subscriber/sub.service';

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"]
})
export class SearchComponent implements OnInit {
  public search_value: string;
  public data;

  public loged_user;
  constructor(
    private searchService: SearchService,
    private auth: AuthService,
    private router: Router,
    private subS:SubService
  ) {}

  ngOnInit() {
    this.loged_user=this.auth.user
  }
  public searchForIt() {
    this.searchService.searchFor(this.search_value).subscribe(res => {
      console.log(res)
      this.data = res;
      // if(this.auth.isLogged){
      //   console.log(this.loged_user)
      //  this.data.korisnici.filter(op=>{
      //    if(this.loged_user.prijatelji.find(el=>el.id===op.id)===null)
      //    return op;
      //  })
     // }
    });
  }
  
  loadProfile(username) {
    this.router.navigate(["/profile/", username]);
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
  loadWriterData(ime,prezime){
    this.router.navigate(["/pisac"],{queryParams:{ime:ime,prezime:prezime}})
  }
  subTo(subto:string){
    if(this.auth.isLogged)
    this.subS.subscribeTo(this.auth.user.username,subto);
    else{
      alert('Please Login');
    }
  }
}
