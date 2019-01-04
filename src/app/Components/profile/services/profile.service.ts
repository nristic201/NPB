import { Injectable } from '@angular/core';
import { Korisnik } from 'src/app/models/Korisnik';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http:HttpClient) { }

  public getProfile(username:string):Observable<Korisnik>{
    return this.http.get<Korisnik>('/profile/'+username)
  }
  
}
