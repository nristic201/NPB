import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { SearchService } from 'src/app/Services/search/search.service';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { BooksService } from 'src/app/Services/books/books.service';



@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
 
  public friends_books=[]
  constructor(private bs:BooksService, private auth:AuthService) {}

  ngOnInit() {
    // if(this.auth.isLogged){
      this.bs.fetchFriendsBooks('comi').subscribe(res=>{
        console.log('knjige od majmuni',res)
      })
      this.bs.fetchMyGenresBooks('comi').subscribe(res=>{
        console.log('oce',res)
      })
    // }
  }
  
}
