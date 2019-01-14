import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Biblioteka } from 'src/app/models/Biblioteka';
import { api_url } from 'src/assets/constants';

@Injectable({
  providedIn: 'root'
})
export class BibliotekaService {

  constructor(private http:HttpClient) { }

  public getBiblioInfo(ime:string):Observable<Biblioteka>{

    return this.http.get<Biblioteka>(`${api_url}biblioteka`,{params:{
      ime:ime
    }})
  }
}
