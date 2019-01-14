import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable ,pipe} from "rxjs";
import { BooksService } from "./books.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class BookDetailResolver implements Resolve<any> {
  constructor(private bs: BooksService, private router: Router) {}
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const naziv = route.paramMap.get("naziv");
    return this.bs.fetchBookData(naziv).pipe(
      map(book => {
        if (book) return book;
        else {
          this.router.navigate(["/home"]);
          return null;
        }
      })
    );
  }
}
