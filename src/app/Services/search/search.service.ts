import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map }from 'rxjs/operators'
import { api_url } from 'src/assets/constants';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  
  constructor(private http:HttpClient) { }

  searchFor(value:string):Observable<any[]>{
    return this.http.post<any[]>(api_url+'search',{
      
      value:value
    })
  }
}
