import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {FavoritePathInfo} from "../../models/FavoritePathInfo";
import {FavoritePathService} from "../../../../shared/services/favorite.path.service";
import {AuthService} from "../../../../core/services/auth.service";
import {
  HistoryDetailedDialogComponent
} from "../../../history/components/history-detailed-dialog/history-detailed-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FavoritePathDetailedCardComponent} from "../favorite-path-detailed-card/favorite-path-detailed-card.component";

@Component({
  selector: 'app-favorite-path-card',
  templateUrl: './favorite-path-card.component.html',
  styleUrls: ['./favorite-path-card.component.css']
})
export class FavoritePathCardComponent implements OnInit{

  obs: Observable<any>;
  dataSource= new MatTableDataSource<FavoritePathInfo>();
  constructor(private favoritePathService:FavoritePathService,private authService:AuthService, public dialog: MatDialog) {
    this.obs = this.dataSource.connect();
  }
  ngOnInit() {
    this.loadData();
  }
  loadData(){
    this.favoritePathService.getFavoritePaths().subscribe({next:(paths)=>{
      this.dataSource.data=paths;
      }})
    document.getElementsByClassName("delete-btn")
  }
  viewDetails(path: any, event:Event) {
    this.dialog.open(FavoritePathDetailedCardComponent,{
      data:path,
      width: '25%',
      backdropClass: 'backdropBackground',
    })

  }
  deletePath(id:number,event:Event){
    event.stopPropagation();
    this.favoritePathService.deleteFavoritePath(id).subscribe({next:(result)=>{
      this.loadData();
      }})
  }
}
