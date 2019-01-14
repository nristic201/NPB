import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-biblio',
  templateUrl: './biblio.component.html',
  styleUrls: ['./biblio.component.css']
})
export class BiblioComponent implements OnInit {

  public biblio_data: any;
  public snapshot:any;
  constructor(private route: ActivatedRoute) {
    this.snapshot=route.snapshot;
  }

  ngOnInit() {
    this.biblio_data= this.snapshot.data['0'];
    console.log('ovde',this.biblio_data)
  }

}
