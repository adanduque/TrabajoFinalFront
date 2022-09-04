import { Component, OnInit, ViewChild } from '@angular/core';
import { VitalSignService } from '../../service/vitalSign.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { VitalSign } from '../../model/vitalSign';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vital-sign',
  templateUrl: './vital-sign.component.html',
  styleUrls: ['./vital-sign.component.css']
})
export class VitalSignComponent implements OnInit {

  displayedColumns: string[] = ['id', 'patient', 'temperature','pulse','swing','vitalSignDate', 'actions'];
  dataSource: MatTableDataSource<VitalSign>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  totalElements: number;
  constructor(
    public route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vitalsignService: VitalSignService
  ) { }

  ngOnInit(): void {
    this.vitalsignService.getVitalSignChange().subscribe(data => {
      this.createTable(data);
    });

    this.vitalsignService.getMessageChange().subscribe(data => {
      this.snackBar.open(data, 'INFO', { duration: 2000, verticalPosition: "top", horizontalPosition: "right" });
    });

    this.vitalsignService.listPageable(0, 5).subscribe(data => {
      this.createTable(data);
    });
    console.log(this.route.children);

  }

  applyFilter(e: any) {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }

  delete(idVitalSign: number){
    Swal.fire({
      title: 'Do you want to delete this record?',
      showDenyButton: true,
      confirmButtonText: 'Ok',
      denyButtonText: `Cancel`,
    }).then((result) => {

      if (result.isConfirmed) {
        this.vitalsignService.delete(idVitalSign).pipe(switchMap( ()=> {
          return  this.vitalsignService.listPageable(0, 5);
        }))
        .subscribe(data => {
          this.vitalsignService.setVitalSignChange(data);
          this.vitalsignService.setMessageChange('DELETED!');
        });

      }
    })

  }


  createTable(vitalsigns: any){
    this.dataSource = new MatTableDataSource(vitalsigns.content);
    this.totalElements = vitalsigns.totalElements;

  }
  showMore(e: any){
    this.vitalsignService.listPageable(e.pageIndex, e.pageSize).subscribe(data => this.createTable(data));
  }

}
