import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SendIsbnService {
  private dataSource = new BehaviorSubject<number>(0);

  data=this.dataSource.asObservable()
  constructor() { }
  updateDataSelection(num:number){
    this.dataSource.next(num);
  }
}
