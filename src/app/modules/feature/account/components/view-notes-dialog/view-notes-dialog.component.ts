import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {UserInfo} from "../../../../shared/models/UserInfo";
import {MatTableDataSource} from "@angular/material/table";
import {Note} from "../../models/Note";
import {MatSort} from "@angular/material/sort";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {HttpErrorResponse} from "@angular/common/http";
import {take} from "rxjs";
import {CreateNoteDialogComponent} from "../create-note-dialog/create-note-dialog.component";

@Component({
  selector: 'app-view-notes-dialog',
  templateUrl: './view-notes-dialog.component.html',
  styleUrls: ['./view-notes-dialog.component.css']
})
export class ViewNotesDialogComponent implements OnInit, AfterViewInit{
  dataSource = new MatTableDataSource<Note>();
  displayedColumns : string[] = ['id','date','message'];
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  constructor(private _userService : UserService, @Inject(MAT_DIALOG_DATA) public user: UserInfo, private _dialog: MatDialog) {  }

  ngOnInit(): void {
    this.getNotes();
  }

  @ViewChild('notesSort') notesSort = new MatSort();
  @ViewChild('notesPaginator') notesPaginator!: MatPaginator;
  ngAfterViewInit(): void {
    this.dataSource.sort = this.notesSort;
    this.dataSource.paginator = this.notesPaginator;
  }

  getNotes(){
    this._userService.getNotes(this.user.id, this.currentPage,this.pageSize).pipe(take(1)).subscribe({
      next:(info) => {
        this.dataSource = new MatTableDataSource<Note>(info.results);
        this.dataSource.sort = this.notesSort;
        setTimeout(() => {
          this.notesPaginator.pageIndex = this.currentPage;
          this.notesPaginator.length = info.totalCount;
        });
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {

        }}})
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getNotes();
  }
  createNote() {
    this._dialog.open(CreateNoteDialogComponent, {
      width: '40%',
      data: this.user
    }).afterClosed().pipe(take(1)).subscribe({
      next: () => {
        this.getNotes();
      }});
  }
}
