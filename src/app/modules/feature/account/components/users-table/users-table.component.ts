import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UserInfo} from "../../../../shared/models/UserInfo";
import {ViewNotesDialogComponent} from "../view-notes-dialog/view-notes-dialog.component";
import {PassengerRegisterComponent} from "../../../../core/components/register/passenger-register/passenger-register.component";
import {take} from "rxjs";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {DriverRegisterComponent} from "../../../../core/components/register/driver-register/driver-register.component";

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.css']
})
export class UsersTableComponent implements AfterViewInit {
  searchText = "";
  dataSource = new MatTableDataSource<UserInfo>();
  selection = new SelectionModel<UserInfo>(false, []);
  displayedColumns: string[] = ["select",'id', 'name', 'surname', 'phone', 'email', 'address', 'role', 'blocked'];
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  public selectedUser: UserInfo = {} as UserInfo;
  constructor(private _userService: UserService, private _dialog: MatDialog, private _snackBar: MatSnackBar,
              private _router: Router) {
  }

  selectHandler(user: UserInfo) {
    if (!this.selection.isSelected(user)) {
      this.selection.clear();
    }
    this.selection.toggle(user);
    this.selectedUser = user;
  }

  isUserBlocked() : boolean{
    return this.selectedUser.blocked
  }

  @ViewChild('usersSort') usersSort = new MatSort();
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.loadData();
    this.dataSource.sort = this.usersSort;
    this.dataSource.paginator = this.usersPaginator;
  }

  loadData() {
    this.selection.clear();
    this._userService.getUsers(this.currentPage, this.pageSize).pipe(take(1)).subscribe({
      next: (info) => {
        //this.dataSource.data = info.results zasto ne moze??
        this.dataSource = new MatTableDataSource<UserInfo>(info.results);
        this.dataSource.sort = this.usersSort;
        setTimeout(() => {
          this.usersPaginator.pageIndex = this.currentPage;
          this.usersPaginator.length = info.totalCount;
        });
      }
    })
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }

  blockUser() {
    this._userService.blockUser(this.selectedUser.id).pipe(take(1)).subscribe({
      next: () => {
        this._snackBar.open("User blocked successfully", "OK");
        this.loadData();
      }
    });
  }

  unblockUser() {
    this._userService.unblockUser(this.selectedUser.id).pipe(take(1)).subscribe({
      next: () => {
        this._snackBar.open("User unblocked successfully", "OK");
        this.loadData();
      }
    });
  }

  showNotes() {
    this._dialog.open(ViewNotesDialogComponent, {
      width: '40%',
      data: this.selectedUser
    });
  }

  updateUser(){
    this._router.navigate(['/account', this.selectedUser.role, this.selectedUser.id])
  }

  showHistory(){
    this._router.navigate(['/history', this.selectedUser.role, this.selectedUser.id])
  }

  createDriver(){
    this._dialog.open(DriverRegisterComponent,{
      width:'40%',
    }).afterClosed().subscribe({
      next: () => {
        this.loadData();
    }});
  }

  createPassenger(){
    this._dialog.open(PassengerRegisterComponent,{
      width:'40%',
      data: false
    }).afterClosed().subscribe({
      next: () => {
        this.loadData();
      }});
  }

  filterUsers(){
    if (this.searchText != ""){
      this.searchText = this.searchText.toLowerCase();
      this.dataSource.data = this.dataSource.data.filter((user) => {
        return user.id.toString().includes(this.searchText) ||
          user.surname.toLowerCase().includes(this.searchText) ||
          user.name.toLowerCase().includes(this.searchText) ||
          user.email.toLowerCase().includes(this.searchText) ||
          user.address.toLowerCase().includes(this.searchText) ||
          user.telephoneNumber.includes(this.searchText) ||
          user.role.toLowerCase().includes(this.searchText);
      })
    } else {
      this.loadData();
    }
  }
}
