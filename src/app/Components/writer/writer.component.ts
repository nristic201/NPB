
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-writer",
  templateUrl: "./writer.component.html",
  styleUrls: ["./writer.component.css"]
})
export class WriterComponent implements OnInit {
  public writer: any;
  public snapshot: any;
  constructor(private route: ActivatedRoute,private router:Router) {
    this.snapshot = route.snapshot;
  }
  ngOnInit() {
    this.writer = this.snapshot.data['0'];
    console.log(this.writer);
  }
  openBookInfo(naziv) {
    this.router.navigate(["/book/", naziv]);
  }
}
