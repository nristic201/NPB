import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Pisac } from 'src/app/models/Pisac';
import { WriterService } from './writer.service';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class WriterResolver implements Resolve<Pisac>{

  constructor(private ws:WriterService,private router:Router) { }

  resolve(route:ActivatedRouteSnapshot):Observable<Pisac>{
    
    console.log(route.queryParams)
    const ime= route.queryParams.ime;
    const prezime = route.queryParams.prezime;
    return this.ws.getWriterInfo(ime,prezime).pipe(
      map(writer=>{
        if(writer)
        return writer;
        else{
          this.router.navigate(['/home'])
          return null;
        }
      })
    )
  }
}
