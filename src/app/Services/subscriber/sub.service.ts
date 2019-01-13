import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_url } from 'src/assets/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubService {

  constructor(
    private http:HttpClient
  ) { }


  subscribeTo(username:string,sub_to:string):Observable<any>{
    return this.http.post(api_url+'subscribe',{username:username,subscribe_to:sub_to})
  }

}
