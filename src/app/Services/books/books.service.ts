import { Injectable } from "@angular/core";
import { Knjiga } from "../../models/Knjiga";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { api_url } from "src/assets/constants";

@Injectable({
  providedIn: "root"
})
export class BooksService {
  private books$: Observable<Knjiga[]>;

  constructor(private http: HttpClient) {
    this.books$ = this.fetchBooks();
  }

  fetchBooks(): Observable<Knjiga[]> {
    return this.http.get<Knjiga[]>(api_url + "fetchbooks");
  }
  getBooks(): Observable<Knjiga[]> {
    return this.books$;
  }
  fetchBookData(naziv: string): Observable<Knjiga> {
    return this.http.get<Knjiga>(`${api_url}book/${naziv}`);
  }
}