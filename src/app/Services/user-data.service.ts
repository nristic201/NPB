import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  
  public username:string;
  constructor(
    private http:HttpClient,
    private router:Router,
    private route:ActivatedRoute
    ) {
    this.route
        .queryParams
        .subscribe(params => {
            this.username = params['username'];    
   })}

  getUserInfo(){
    this.http.post('/api/profile/'+this.username,{username:this.username})
  }
}
