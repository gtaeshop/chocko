import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarWeekViewComponent } from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Subject } from 'rxjs';

registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  rooms: any[] = [];
  teachers: any[] = [];
  classes: any[] = [];
  url: string = "http://localhost:3333";
  bSupprimerAjouter = false;
  refresh = new Subject<void>();

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTimetableData();
    this.loadTeachers();
    this.loadRooms();
  }

  loadTeachers() {
    this.http.get(`${this.url}/teachers`).subscribe((data: any) => {
      this.teachers = data;
    });
  }

  loadRooms() {
    this.http.get(`${this.url}/rooms`).subscribe((data: any) => {
      this.rooms = data;
    });
  }

  loadTimetableData() {
    this.http.get(`${this.url}/classes`).subscribe((data: any) => {
      this.classes = data;
      this.events = data.map((cls: any) => ({
        id: cls.id,
        title: `${cls.name} - ${cls.subject} (${this.getTeacherName(cls.teacherId)}) dans ${this.getRoomName(cls.roomId)} [${cls.session}]`,
        start: new Date(cls.start),
        end: new Date(cls.end),
        draggable: true,
        resizable: { beforeStart: true, afterEnd: true },
      }));
      this.refresh.next();
      this.cdr.detectChanges();
    });
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('eveeee')
    const theClass = this.classes.find(cls => cls.id === event.id);
    if (!theClass) return;
    
    if (this.bSupprimerAjouter) {
      this.delete(theClass);
      return;
    }
    
    this.openSessionDialog(theClass);
  }

  hourSegmentClicked(event: any) {
    this.openSessionDialog();
  }

  openSessionDialog(data?: any): void {
    this.dialog.open(this.dialogTemplate, { data });
  }

  submitSession(sessionData: any) {
    const newEvent: CalendarEvent = {
      start: new Date(sessionData.startTime),
      end: new Date(sessionData.endTime),
      title: `${sessionData.className} - ${sessionData.subject} (${sessionData.teacher}) dans ${sessionData.room} [${sessionData.session}]`,
      draggable: true,
      resizable: { beforeStart: true, afterEnd: true }
    };
    
    const url = `${this.url}/classes`;
    const request = sessionData.id ? this.http.put(`${url}/${sessionData.id}`, newEvent) : this.http.post(url, newEvent);
    
    request.subscribe(() => {
      this.loadTimetableData();
      this.dialog.closeAll();
    });
  }

  delete(sessionData: any) {
    this.http.delete(`${this.url}/classes/${sessionData.id}`).subscribe(() => {
      this.loadTimetableData();
    });
  }

  getTeacherName(teacherId: number): string {
    return this.teachers.find(t => t.id === teacherId)?.name || 'Inconnu';
  }

  getRoomName(roomId: number): string {
    return this.rooms.find(r => r.id === roomId)?.name || 'Inconnu';
  }


  switchMode(){
    this.bSupprimerAjouter= !this.bSupprimerAjouter;

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
  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log(event)
    event.start = newStart;
    event.end = newEnd;
    let url='${this.url}/classes' 


    this.http.patch(url+'/'+event.id,event).subscribe((data: any) => {
      this.loadTimetableData();
    });
    this.refresh.next();
  }

}
