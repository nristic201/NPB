import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  public book: any;
  public snapshot:any;
  constructor(private route: ActivatedRoute) {
    this.snapshot=route.snapshot;
  }

  ngOnInit() {
    //treba da se promeni u resolveru...
    this.book = this.snapshot.data['profile'];
    console.log(this.book)
  }


}
