import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookComponent } from 'src/app/Components/book/book.component';
import { BookDetailResolver } from 'src/app/Services/books/book-detail-resolver.service';

const bookRoutes: Routes = [
  {
    path: ':naziv',
    component: BookComponent,
    resolve: {
      profile: BookDetailResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(bookRoutes)],
  exports: [RouterModule],
  providers:[BookDetailResolver]
})
export class BookRoutingModule { }
