import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Korisnik } from '../models/Korisnik';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http:HttpClient
  ) { }

  login(user:Korisnik){
    this.http.post('/login',{user:user})
    .subscribe(res=>{
      console.log('lele');
    })
  }
}
