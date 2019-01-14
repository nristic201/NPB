import { Component, OnInit } from "@angular/core";;
import { ProfileService } from "../../Services/profile/profile.service";
import { Observable } from "rxjs";
import { ActivatedRouteSnapshot, ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  public user: any;
  public snapshot:any;
  constructor(private route: ActivatedRoute,private router:Router) {
    this.snapshot=route.snapshot;
  }

  ngOnInit() {
    this.user = this.snapshot.data['profile'];
    console.log('ovde',this.user)
  }
}
