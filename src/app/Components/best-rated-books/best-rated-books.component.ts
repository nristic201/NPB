import { Component, OnInit } from "@angular/core";
import { BooksService } from "src/app/Services/books/books.service";
import { Observable } from "rxjs";
import { Router } from '@angular/router';

@Component({
  selector: "app-best-rated-books",
  templateUrl: "./best-rated-books.component.html",
  styleUrls: ["./best-rated-books.component.css"]
})
export class BestRatedBooksComponent implements OnInit {
  public best_rated:any[];

  constructor(private bookService: BooksService,private router:Router) {}

  ngOnInit() {
    this.bookService.getBooks().subscribe((res:any[])=>{
      this.best_rated=res
    });
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
