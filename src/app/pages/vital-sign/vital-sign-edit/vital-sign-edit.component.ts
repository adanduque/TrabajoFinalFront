import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VitalSignService } from '../../../service/vitalSign.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { switchMap, Observable, map } from 'rxjs';
import { VitalSign } from '../../../model/vitalSign';
import { Patient } from '../../../model/patient';
import { PatientService } from '../../../service/patient.service';
import { MatDialog } from '@angular/material/dialog';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vital-sign-edit',
  templateUrl: './vital-sign-edit.component.html',
  styleUrls: ['./vital-sign-edit.component.css']
})
export class VitalSignEditComponent implements OnInit {

  id: number;
  isEdit: boolean;
  form: FormGroup;
  patientsFiltered$: Observable<Patient[]>
  patients: Patient[]=[];
  patientControl: FormControl = new FormControl();
  maxDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vitalSignService: VitalSignService,
    private patientService: PatientService,
    public dialog: MatDialog
  ) { }
  ngOnInit(): void {

    this.form = new FormGroup({
      'idVitalSign': new FormControl(0),
      'patient' : this.patientControl,
      'temperature': new FormControl('',  [Validators.required, Validators.minLength(2)]),
      'pulse': new FormControl('', [Validators.required, Validators.minLength(2)]),
      'swing': new FormControl('', [Validators.required, Validators.minLength(2)]),
      'vitalSignDate': new FormControl('', [Validators.required])
    });

    this.route.params.subscribe(data => {
      this.id = data['id'];
      this.isEdit = data['id'] != null;
      this.initForm();
    })

    this.loadInitialData();
    this.patientsFiltered$ = this.patientControl.valueChanges.pipe(map(val => {
     return this.filterPatients(val);
      }
    ));
  }

  loadInitialData(){
    this.patientService.findAll().subscribe(data => this.patients = data);
  }

  initForm() {

    if (this.isEdit) {

      this.vitalSignService.findById(this.id).subscribe(data => {
        this.patientControl.setValue(data.patient);

        this.form = new FormGroup({
          'idVitalSign': new FormControl(data.idVitalSign),
          'patient' :  this.patientControl ,//this.patientControl,
          'temperature': new FormControl(data.temperature,  [Validators.required, Validators.minLength(2)]),
          'pulse': new FormControl(data.pulse, [Validators.required, Validators.minLength(2)]),
          'swing': new FormControl(data.swing, [Validators.required, Validators.minLength(2)]),
          'vitalSignDate': new FormControl(data.vitalSignDate, [Validators.required])
        });

      });
    }
  }

  get f() {
    return this.form.controls;
  }

  operate() {
    if (this.form.invalid) { return; }

    let vitalsign = new VitalSign();
    vitalsign.idVitalSign = this.form.value['idVitalSign'];
    vitalsign.patient = this.form.value['patient'];
    vitalsign.temperature = this.form.value['temperature'];
    vitalsign.pulse = this.form.value['pulse'];
    vitalsign.swing = this.form.value['swing'];
    vitalsign.vitalSignDate = this.form.value['vitalSignDate'];





    if (this.isEdit) {

      Swal.fire({
        title: 'Do you want to modify this record?',
        showDenyButton: true,
        confirmButtonText: 'Ok',
        denyButtonText: `Cancel`,
      }).then((result) => {

        if (result.isConfirmed) {
          this.vitalSignService.update(vitalsign).subscribe(() => {
            this.vitalSignService.listPageable(0, 5).subscribe(response => {

               this.vitalSignService.setVitalSignChange(response);
               this.vitalSignService.setMessageChange('UPDATED!')
               this.router.navigate(['/pages/vitalSign']);
             });
           });
        }
      })


    } else {

      Swal.fire({
        title: 'Do you want to add this record?',
        showDenyButton: true,
        confirmButtonText: 'Ok',
        denyButtonText: `Cancel`,
      }).then((result) => {

        if (result.isConfirmed) {
          this.vitalSignService.save(vitalsign).pipe(switchMap(()=>{
            return  this.vitalSignService.listPageable(0, 5);
          }))
          .subscribe(data => {
            this.vitalSignService.setVitalSignChange(data);
            this.vitalSignService.setMessageChange("CREATED!")
            this.router.navigate(['/pages/vitalSign']);
          });
        }
      })


    }

  }

  filterPatients(val: any){
    if(val?.idPatient > 0){
      return this.patients.filter(el =>
        el.firstName.toLowerCase().includes(val.firstName.toLowerCase()) || el.lastName.toLowerCase().includes(val.lastName.toLowerCase()) || el.dni.includes(val)
      )
    }else{
      return this.patients.filter(el =>
        el.firstName.toLowerCase().includes(val?.toLowerCase()) || el.lastName.toLowerCase().includes(val?.toLowerCase()) || el.dni.includes(val)
      )
    }
  }

  showPatient(val: any){
    return val ? `${val.firstName} ${val.lastName}` : val;
  }


  openDialog(){
    const dialogRef =  this.dialog.open(PatientDialogComponent, {
      width: '400px',
      data: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        this.patientControl.setValue(result);
      }

    });
  }
}
