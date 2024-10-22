import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Subject } from 'rxjs';

registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <button (click)="openSessionDialog()">Ajouter</button>
    <button (click)="switchMode()">cliquer pour {{bSupprimerAjouter?" Supprimer": " Editer"}} </button>
    <button (click)="filter()">Filter</button>

    <mwl-calendar-week-view
      [viewDate]="viewDate"
      [events]="events"
      (eventClicked)="eventClicked($event)"
      [hourSegments]="2"
      [hourSegmentHeight]="15"
      [locale]="'fr'"
      [dayStartHour]="08"
      [dayEndHour]="17"

      [refresh]="refresh"
      (eventTimesChanged)="eventTimesChanged($event)"
    ></mwl-calendar-week-view>
    
    <ng-template #dialogTemplate let-data>
      <h2>Ajouter une session</h2>
      <form #sessionForm="ngForm" (ngSubmit)="submitSession(sessionForm.value)">
        <label for="className">Classe:</label>
        <input id="className" name="className" ngModel [ngModel]="data?.name">

        <label for="teacher">Enseignant:</label>
        <input id="teacher" name="teacher" ngModel [ngModel]="data?.teacherId">

        <label for="room">Salle:</label>
        <input id="room" name="room" ngModel [ngModel]="data?.roomId">

        <label for="subject">Sujet:</label>
        <input id="subject" name="subject" ngModel [ngModel]="data?.subject">

        <label for="startTime">Heure de début:</label>
        <input id="startTime" name="startTime" type="datetime-local" ngModel [ngModel]="data?.start">
        <label for="endTime">Heure de fin:</label>
        <input id="endTime" name="endTime" type="datetime-local" ngModel [ngModel]="data?.end">

        <label for="session">Session:</label>
        <input id="session" name="session" ngModel [ngModel]="data?.session">

        <button type="submit"> {{data?.id?"Update":"Ajouter"}}</button>
      </form>
    </ng-template>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  rooms: any[]=[]
  teachers: any[]=[]
  classes: any[]=[]

  bSupprimerAjouter=false

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;  // Add this line

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient, 
    public dialog: MatDialog) {
      this.loadTeachers();
      this.loadRooms();
     // this.loadClasses();

    }
  ngOnInit() {
    this.loadTimetableData();
  }
  loadTeachers() {
    let url='http://localhost:3333/teachers' 
    this.http.get(url).subscribe((data: any) => {
      this.teachers = data
      console.log(this.teachers)
    });
  }
  loadRooms() {
    let url='http://localhost:3333/rooms' 
    this.http.get(url).subscribe((data: any) => {
      this.rooms = data
      console.log(this.rooms)
    });
  }
  loadClasses() {
    let url='http://localhost:3333/classes' 
    this.http.get(url).subscribe((data: any) => {
      this.classes = data
      console.log(this.classes)
    });
  }

  filter(){
   // this.classes.
   console.log(this.classes)
   
    this.events=this.classes.filter(cl=>cl.teacherId==1).map((cls: any) => ({
      subject:cls.subject,
      name:cls.name,
      id:cls.id,
      teacherId:cls.teacherId,
      roomId:cls.roomId,

     
     
      start: new Date(cls.start),
      end: new Date(cls.end),
      title: `${cls.name} - ${cls.subject} (${this.getTeacherName( cls.teacherId)}) dans ${this.getRoomName( cls.roomId)} [${cls.session}]`,
       draggable: true,
      resizable: {
       beforeStart: true,
       afterEnd: true,         
    },
    }));
    this.refresh.next();
    this.cdr.detectChanges()
  
  }
  loadTimetableData() {
    let url='http://localhost:3333/classes' 
   // let url=assets/timetable.json'

    this.http.get(url).subscribe((data: any) => {

      console.log(data)
      this.classes=data
      this.events = data.map((cls: any) => ({
        subject:cls.subject,
        name:cls.name,
        id:cls.id,
        teacherId:cls.teacherId,
        roomId:cls.roomId,

       
       
        start: new Date(cls.start),
        end: new Date(cls.end),
        title: `${cls.name} - ${cls.subject} (${this.getTeacherName( cls.teacherId)}) dans ${this.getRoomName( cls.roomId)} [${cls.session}]`,
         draggable: true,
        resizable: {
         beforeStart: true,
         afterEnd: true,         
      },
      }));
      this.refresh.next();
      this.cdr.detectChanges()
    });
  }

  getTeacherName(teacherId: number): string {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Inconnu';
  }

  getClassById(classId: number): any {
    console.log(this.classes)
    return this.classes.find(t => t.id === classId);
  }

  getRoomName( roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Inconnu';
  }

  classToEdit:any
  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Événement cliqué', event );

  let theClass=this.getClassById(event.id as number)
  console.log('Événement cliqué', theClass );

  if (this.bSupprimerAjouter){
   this.delete(theClass);
   return
  }
  const data =  theClass
    ? {
        ...event,
        start: this.formatDateForInput(event.start),
        end: this.formatDateForInput(event.end),
        session:theClass.session,

      subject: theClass.subject,
      className: theClass.name,
      teacherId: theClass.teacherId,
      roomId: theClass.roomId,
      }
    : null;

    this.classToEdit=data
    console.log(this.classToEdit)
    const dialogRef = this.dialog.open(this.dialogTemplate,{data:data});

  }

  switchMode(){
    this.bSupprimerAjouter= !this.bSupprimerAjouter;

  }
  openSessionDialog(): void {


    if (this.bSupprimerAjouter){     
      return
    }
    const dialogRef = this.dialog.open(this.dialogTemplate);

    dialogRef.afterClosed().subscribe((result:any) => {
      console.log('dialogue closed',result);
      // if (result) {
      //   this.submitSession(result);
      // }
    });

  }


  // this.events = [
  //   ...this.events,
  //   {
  //     title: 'New event',
  //     start: startOfDay(new Date()),
  //     end: endOfDay(new Date()),
  //     color: colors.red,
  //     draggable: true,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //   },
  // ];

  submitSession(sessionData: any) {

    const newEvent: CalendarEvent = {
      start: new Date(sessionData.startTime),
      end: new Date(sessionData.endTime),
      title: `${sessionData.className} - ${sessionData.subject} (${sessionData.teacher}) dans ${sessionData.room} [${sessionData.session}]`,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      }
    };

console.log(sessionData)
console.log(newEvent)
console.log(this.classToEdit)



    const toAdd = {
        ...newEvent,
      subject: sessionData?.subject,
      name: sessionData?.className,
      teacherId: Number(sessionData?.teacher),
      roomId: Number(sessionData?.room),
      session:sessionData?.session
      }
      let url='http://localhost:3333/classes' 


if  (  this.classToEdit)
      
      this.http.put(url+'/'+this.classToEdit.id,toAdd).subscribe((data: any) => {
        console.log(data)
        this.loadTimetableData();
      });  
      else      
      this.http.post(url,toAdd).subscribe((data: any) => {
        this.loadTimetableData();
      });

    this.dialog.closeAll()
    this.classToEdit=undefined

  }
  delete(sessionData:any){

    console.log(sessionData)
    let url='http://localhost:3333/classes' 
    this.http.delete(url+'/'+sessionData.id).subscribe((data: any) => {
      this.loadTimetableData();
    });
  }

  refresh = new Subject<void>();

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log(event)
    event.start = newStart;
    event.end = newEnd;
    let url='http://localhost:3333/classes' 


    this.http.patch(url+'/'+event.id,event).subscribe((data: any) => {
      this.loadTimetableData();
    });
    this.refresh.next();
  }


   // Utility to format date for input[type="datetime-local"]
   formatDateForInput(date?: Date): string {

    if (!date) return ''; // Handle undefined by returning an empty string

    const pad = (n: number) => n < 10 ? '0' + n : n;

    return date?.getFullYear() + '-' +
           pad(date?.getMonth() + 1) + '-' +
           pad(date.getDate()) + 'T' +
           pad(date.getHours()) + ':' +
           pad(date.getMinutes());
  }
}
