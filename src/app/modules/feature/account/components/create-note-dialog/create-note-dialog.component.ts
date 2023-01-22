import {Component, Inject} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {UserService} from "../../../../shared/services/user.service";
import {UserInfo} from "../../../../shared/models/UserInfo";
import {take} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-create-note-dialog',
  templateUrl: './create-note-dialog.component.html',
  styleUrls: ['./create-note-dialog.component.css']
})
export class CreateNoteDialogComponent {
  public note : string = "";
  constructor(private _userService : UserService, @Inject(MAT_DIALOG_DATA) public user: UserInfo, private _snackBar: MatSnackBar) {  }

  createNote(){
    this._userService.createNote(this.user.id, this.note).pipe(take(1)).subscribe({
      next:() =>{
        this._snackBar.open("Note created successfully", "OK");
      },
      error : (error) =>{
        if (error instanceof HttpErrorResponse) {

        }
      }
    });
  }
}
