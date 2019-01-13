import { Component, OnInit } from "@angular/core";
import { Korisnik } from "src/app/models/Korisnik";
import { ProfileService } from "../../Services/profile/profile.service";
import { Observable } from "rxjs";
import { ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  public user: any;
  public snapshot:any;
  constructor(private route: ActivatedRoute) {
    this.snapshot=route.snapshot;
  }

  ngOnInit() {
    this.user = this.snapshot.data['profile'];
    console.log('ovde',this.user.iznajmljene_knjige)
  }
}
