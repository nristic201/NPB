import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Korisnik } from 'src/app/models/Korisnik';
import { ProfileService } from './profile.service';
import { Observable } from 'rxjs';
import {map }from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProfileDetailResolver implements Resolve<Korisnik> {

  constructor(private ps:ProfileService,private router:Router) { }

  resolve(route:ActivatedRouteSnapshot):Observable<Korisnik>{
    const username= route.paramMap.get('username');
    return this.ps.getProfile(username).pipe(
      map(profile=>{
        if(profile)
        return profile;
        else{
          this.router.navigate(['/home'])
          return null;
        }
      })
    )
  }
}
