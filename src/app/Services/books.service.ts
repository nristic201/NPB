import { Injectable } from "@angular/core";
import { Knjiga } from "../models/Knjiga";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class BooksService {
  private books$: Observable<Knjiga[]>;

  constructor(private http: HttpClient) {
    this.books$=this.fetchBooks();
  }

  fetchBooks(): Observable<Knjiga[]> {
    return this.http.get<Knjiga[]>("http://localhost:3000/api/fetchbooks");
  }
  getBooks():Observable<Knjiga[]>{
    return this.books$;
  }
}
