import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../../../shared/services/user.service";
import {HttpErrorResponse} from "@angular/common/http";
import {take} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ImageService} from "../../../../core/services/image.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit{
  @Input()
  public userId: number = -1;
  @Input()
  public role: string = "";
  public accountInfoForm : FormGroup;
  public editEnabled: boolean;
  public profilePicture: any;
  public uploadedImage: any
  TEL_REGEX:string = "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s./0-9]{0,10}$";
  constructor(private _sanitizer: DomSanitizer, private _snackBar: MatSnackBar, private _imageService: ImageService, private _userService: UserService) {
    this.accountInfoForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      profilePicture: new FormControl('', [Validators.required]),
      telephoneNumber: new FormControl('', [Validators.required, Validators.pattern(this.TEL_REGEX)]),
      address: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
    this.accountInfoForm.disable();
    this.editEnabled = false;
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() : void{
    this._userService.getUser(this.userId, this.role).pipe(take(1)).subscribe({
      next:(info) => {
        this.accountInfoForm.patchValue({
          name: info.name,
          surname: info.surname,
          profilePicture: info.profilePicture,
          telephoneNumber: info.telephoneNumber,
          address: info.address,
          email: info.email,
        });
        this._imageService.getProfilePicture(this.accountInfoForm.controls['profilePicture'].value).then(resp => {
            let objectURL = URL.createObjectURL(resp);
            this.profilePicture = this._sanitizer.bypassSecurityTrustUrl(objectURL);
        });},
      error: (error) => {
        if (error instanceof HttpErrorResponse) {

        }}})
  }

  enableEdit() : void{
    this.accountInfoForm.enable();
    this.editEnabled = true;
  }

  cancelEdit() : void{
    this.accountInfoForm.disable();
    this.editEnabled = false;
    this.uploadedImage = null;
    this.loadUserData();
  }

  submitEdit() : void {
    if (this.uploadedImage != null) {
      const driverFormData = new FormData();
      driverFormData.append('image', this.uploadedImage, this.uploadedImage.name);
      this._imageService.createProfilePicture(this.userId, driverFormData).subscribe({
        next: (result) => {
          this.accountInfoForm.controls['profilePicture'].patchValue(result.pictureName);
          this._userService.updateUser(this.userId, this.role, this.accountInfoForm.value).pipe(take(1)).subscribe(
            {
              next: (info) => {
                this.loadUserData();
                this._snackBar.open("Account updated successfully!", "OK");
              },
              error: (error) => {
                if (error instanceof HttpErrorResponse) {

                }
              }
            });
        },
        error: () => {
        }
      })
    }
    else{
      this._userService.updateUser(this.userId, this.role, this.accountInfoForm.value).pipe(take(1)).subscribe(
        {
          next: (info) => {
            this.loadUserData();
            this._snackBar.open("Account updated successfully!", "OK");
          },
          error: (error) => {
            if (error instanceof HttpErrorResponse) {

            }
          }
        });
    }

    this.accountInfoForm.disable();
    this.editEnabled = false;
  }

  public onImageUpload(event:Event) {
    //@ts-ignore
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.uploadedImage)
    reader.onload = (_event) => {
      this.profilePicture = reader.result;
    }
  }

  onProfilePictureError(event : any) {
    event.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
  }
}
