import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Biblioteka } from 'src/app/models/Biblioteka';
import { BibliotekaService } from './biblioteka.service';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators'
@Injectable({
  providedIn: 'root'
})
export class BibliotekaResolver implements Resolve<Biblioteka> {

  
  constructor(private bs:BibliotekaService,private router:Router) { }

  resolve(route:ActivatedRouteSnapshot):Observable<Biblioteka>{
    const username= route.paramMap.get('ime');
    return this.bs.getBiblioInfo(username).pipe(
      map(bib=>{
        if(bib)
        return bib;
        else{
          this.router.navigate(['/home'])
          return null;
        }
      })
    )
  }
}
