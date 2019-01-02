import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/Services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  public search_value:string;
  public criteria:string;
  public data$:Observable<any[]>;

  constructor(
    private searchService:SearchService
  ) { }

  ngOnInit() {
  }
  public searchForIt(){
    this.data$=this.searchService.searchFor(this.criteria,this.search_value);
  }
}
