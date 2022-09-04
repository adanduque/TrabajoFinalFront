import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../service/patient.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Patient } from '../../../model/patient';
import { switchMap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-dialog',
  templateUrl: './patient-dialog.component.html',
  styleUrls: ['./patient-dialog.component.css']
})
export class PatientDialogComponent implements OnInit {

  id: number;
  isEdit: boolean;
  form: FormGroup;
  text:string='Register';
  constructor(
    private patientService: PatientService,
    public dialogRef: MatDialogRef<PatientDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'idPatient': new FormControl(0),
      'firstName': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'lastName': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'dni': new FormControl('', [Validators.required, Validators.maxLength(8)]),
      'address': new FormControl(''),
      'phone': new FormControl('', [Validators.required, Validators.minLength(9)]),
      'email': new FormControl('', [Validators.required, Validators.email])
    });


  }



  get f() {
    return this.form.controls;
  }

  operate() {
    if (this.form.invalid) { return; }

    let patient = new Patient();
    patient.idPatient = this.form.value['idPatient'];
    patient.firstName = this.form.value['firstName'];
    patient.lastName = this.form.value['lastName'];
    patient.dni = this.form.value['dni'];
    patient.address = this.form.value['address'];
    patient.phone = this.form.value['phone'];
    patient.email = this.form.value['email'];


      //INSERT
      //PRACTICA IDEAL
      this.patientService.save(patient)
      .subscribe(response => {
        let tam = response.headers.get('Location').length;
        let pos = response.headers.get('Location').lastIndexOf("/")+1;
        console.log(response.headers.get('Location').substring(pos,tam))
        let id= +response.headers.get('Location').substring(pos,tam);
        this.patientService.findById(id).subscribe(data=>{
          this.onNoClick(data);
        })

      });

  }
  onNoClick(patient?:Patient): void {
    this.dialogRef.close(patient);

  }
}
