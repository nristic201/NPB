import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SearchService } from "src/app/Services/search/search.service";
import { ProfileService } from "../../Services/profile/profile.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"]
})
export class SearchComponent implements OnInit {
  public search_value: string;
  public data;

  constructor(
    private searchService: SearchService,
    private userDetails: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {}
  public searchForIt() {
    this.searchService.searchFor(this.search_value).subscribe(res => {
      this.data = res;
    });
  }
  loadProfile(username) {
    this.router.navigate(["/profile/", username]);
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
