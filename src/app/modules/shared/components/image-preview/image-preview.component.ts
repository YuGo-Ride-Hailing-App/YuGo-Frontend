import {Component, Inject, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {ImageService} from "../../../core/services/image.service";
import {
  HistoryDetailedDialogComponent
} from "../../../feature/history/components/history-detailed-dialog/history-detailed-dialog.component";

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent{
  image: any;
  constructor(private sanitizer: DomSanitizer,private imageService:ImageService,
              @Inject(MAT_DIALOG_DATA) private url: string) {
  }

  ngAfterContentInit(): void {
    this.imageService.getImage(this.url).then(resp => {
    let objectURL = URL.createObjectURL(resp);
    this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  })}


}
