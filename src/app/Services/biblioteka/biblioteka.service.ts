import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api_url } from 'src/assets/constants';

@Injectable({
  providedIn: 'root'
})
export class BibliotekaService {

  constructor(private http:HttpClient) { }

  public getBiblioInfo(ime:string):Observable<any>{

    return this.http.get<any>(`${api_url}biblioteka`,{params:{
      ime:ime
    }})
  }
}
