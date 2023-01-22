import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Observable, take} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {HttpErrorResponse} from "@angular/common/http";
import {Panic} from "../models/Panic";
import {PanicService} from "../../../shared/services/panic.service";

@Component({
  selector: 'app-users-panics',
  templateUrl: './users-panics.component.html',
  styleUrls: ['./users-panics.component.css']
})
export class UsersPanicsComponent implements OnInit, AfterViewInit{
  dataSource= new MatTableDataSource<Panic>();
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  dataSourceObservable: Observable<any>;
  constructor(private _panicService: PanicService, private _snackBar : MatSnackBar) {
    this.dataSourceObservable = this.dataSource.connect();
  }

  @ViewChild('panicsPaginator') panicsPaginator!: MatPaginator;
  ngOnInit() {
    this.loadData();
  }
  ngAfterViewInit(){
    this.dataSource.paginator = this.panicsPaginator;
  }

  loadData() : void{
    this._panicService.getPanics(this.currentPage, this.pageSize).pipe(take(1)).subscribe({
      next: (results) => {
        this.dataSource.data = results.results;
        setTimeout(() => {
          this.panicsPaginator.pageIndex = this.currentPage;
          this.panicsPaginator.length = results.totalCount;
        });
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {
        }
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }
}
