import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api_url } from 'src/assets/constants';

@Injectable({
  providedIn: 'root'
})
export class WriterService {

  constructor(private http:HttpClient) { }
  public getWriterInfo(ime:string,prezime:string):Observable<any>{

    return this.http.get<any>(`${api_url}pisac`,{params:{
      ime:ime,
      prezime:prezime
    }})
  }
  
}
