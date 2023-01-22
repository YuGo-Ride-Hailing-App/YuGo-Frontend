import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {VehicleService} from "../../../shared/services/vehicle.service";
import {Observable, take} from "rxjs";
import {VehicleChangeRequest} from "../model/VehicleChangeRequest";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {HttpErrorResponse} from "@angular/common/http";
import {Vehicle} from "../../../shared/models/Vehicle";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-vehicle-change-requests',
  templateUrl: './vehicle-change-requests.component.html',
  styleUrls: ['./vehicle-change-requests.component.css']
})

export class VehicleChangeRequestsComponent implements OnInit, AfterViewInit{
  dataSource= new MatTableDataSource<VehicleChangeRequest>();
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  dataSourceObservable: Observable<any>;
  constructor(private _vehicleService: VehicleService, private _snackBar : MatSnackBar) {
    this.dataSourceObservable = this.dataSource.connect();
  }

  @ViewChild('requestsPaginator') requestsPaginator!: MatPaginator;
  ngOnInit() {
    this.loadData();
  }
  ngAfterViewInit(){
    this.dataSource.paginator = this.requestsPaginator;
  }

  loadData() : void{
    this._vehicleService.getVehicleChangeRequests(this.currentPage, this.pageSize).pipe(take(1)).subscribe({
      next: (results) => {
        this.dataSource.data = results.results;
        setTimeout(() => {
          this.requestsPaginator.pageIndex = this.currentPage;
          this.requestsPaginator.length = results.totalCount;
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

  reject(request: VehicleChangeRequest) : void{
    this._vehicleService.rejectVehicleChangeRequest(request.id).pipe(take(1)).subscribe({
      next: (result) => {
        this._snackBar.open(result.message, "OK");
        this.loadData();
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {

        }
      }
    });
  }

  accept(request: VehicleChangeRequest) : void{
    this._vehicleService.acceptVehicleChangeRequest(request.id).pipe(take(1)).subscribe({
      next: (result) => {
        this._snackBar.open(result.message, "OK");
        this.loadData();
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {

        }
      }
    });
  }
}
