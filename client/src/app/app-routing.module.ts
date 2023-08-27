import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksCatalogueComponent } from './books-catalogue/books-catalogue.component';

const routes: Routes = [
  { path: 'books', component: BooksCatalogueComponent },
  { path: '', redirectTo: 'books', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
