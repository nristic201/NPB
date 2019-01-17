import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";
import { api_url } from "src/assets/constants";

@Injectable({
  providedIn: "root"
})
export class ProfileService {
  
  private dataSource = new BehaviorSubject<any>(null);
  data = this.dataSource.asObservable();

  updatedDataSelection(data: any){
    this.dataSource.next(data);
  }

  constructor(private http: HttpClient) {}

  public getProfile(username: string){
    this.http.get<any>(`${api_url}profile/${username}`).subscribe(res=>{
      this.updatedDataSelection(res)
    });
  }
  
}
