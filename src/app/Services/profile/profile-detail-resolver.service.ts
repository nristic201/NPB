// import { Injectable } from '@angular/core';
// import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
// import { ProfileService } from './profile.service';
// import { Observable } from 'rxjs';
// import {map }from 'rxjs/operators'

// @Injectable({
//   providedIn: 'root'
// })
// export class ProfileDetailResolver implements Resolve<any> {

//   constructor(private ps:ProfileService,private router:Router) { }

//   resolve(route:ActivatedRouteSnapshot):Observable<any>{
//     const username= route.paramMap.get('username');
//     return this.ps.getProfile(username).pipe(
//       map(profile=>{
//         if(profile)
//         return profile;
//         else{
//           this.router.navigate(['/home'])
//           return null;
//         }
//       })
//     )
//   }
// }
