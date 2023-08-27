import { Component, EventEmitter, Output } from '@angular/core';
import { BooksService } from '../books.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { filter, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';
import { Book } from '../book';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() itemsFound = new EventEmitter<Book[]>();
  itemOptions: Observable<Book[]>;

  searchForm = this.fb.group({
    query: ['', Validators.required],
  });

  constructor(
    private booksService: BooksService,
    private fb: FormBuilder,
  ) {
    this.search(this.searchForm.controls.query).subscribe(
      items => {
        this.itemsFound.next(items)
      }
    );
  }

  private search(formControl: FormControl<any>) {
    return formControl.valueChanges.pipe(
      filter(text => text!.length > 1),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchTerm => this.booksService.search(searchTerm!)),
    );
  }
}
