import {AfterContentInit, Component, Inject} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {MAT_DIALOG_DATA,} from "@angular/material/dialog";
import {ImageService} from "../../../core/services/image.service";

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent implements AfterContentInit{
  image: any;
  constructor(private sanitizer: DomSanitizer,private imageService:ImageService,
              @Inject(MAT_DIALOG_DATA) private url: string) {
  }

  ngAfterContentInit(): void {
    this.imageService.getImage(this.url).then(resp => {
    const objectURL = URL.createObjectURL(resp);
    this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  })}


}
