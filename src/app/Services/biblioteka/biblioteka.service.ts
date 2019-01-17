import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { api_url } from "src/assets/constants";

@Injectable({
  providedIn: "root"
})
export class BibliotekaService {
  private dataSource = new BehaviorSubject<any>(null);
  data = this.dataSource.asObservable();

  updatedDataSelection(data: any) {
    this.dataSource.next(data);
  }

  constructor(private http: HttpClient) {}

  public getBiblioInfo() {
    this.http
      .get<any>(`${api_url}biblioteka`)
      .subscribe(res => {
        this.updatedDataSelection(res);
      });
  }
  public oceniKnjigu(isbn, username, ocena) {
    this.http
      .post(api_url + "oceni", {
        isbn: isbn,
        username: username,
        ocena: ocena
      })
      .subscribe(res => {
        this.getBiblioInfo();
      });
  }
}
