import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { api_url } from "src/assets/constants";

@Injectable({
  providedIn: "root"
})
export class BooksService {
  private books$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.books$ = this.fetchBooks();
  }

  fetchBooks(): Observable<any[]> {
    return this.http.get<any[]>(api_url + "fetchbooks");
  }
  getBooks(): Observable<any[]> {
    return this.books$;
  }
  fetchBookData(naziv: string): Observable<any> {
    return this.http.get<any>(`${api_url}book/${naziv}`);
  }

  fetchFriendsBooks(username: string): Observable<any> {
    return this.http.get(api_url + "friendsbooks", {
      params: {
        username: username
      }
    });
  }
  fetchMyGenresBooks(username: string): Observable<any> {
    return this.http.get(api_url + "mygenresbooks", {
      params: {
        username: username
      }
    });
  }
  oslobodiKnjigu(isbn: number, username: string):Observable<any>{
    return this.http.post(api_url + "biblioteka/oslobodi", {
        username: username,
        isbn:isbn
    })
  }
}
