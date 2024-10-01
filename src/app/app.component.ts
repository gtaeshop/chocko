import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { addDays, addHours, startOfDay } from 'date-fns';
import { middleware } from './middleware';


export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};



@Component(
  { selector: 'app-root', 
  template: `
  <button (click)="check()">check</button>
  <mwl-calendar-week-view
  [viewDate]="viewDate"
  [events]="events"
  (eventClicked)="eventClicked($event)"
  

>
</mwl-calendar-week-view>
  `,
   styles: [] })
  

  export class AppComponent { /// implements OnInit {

  async check(){
    await middleware()

}
    
  //async 
  // ngOnInit(): Promise<void> {
  // }




    viewDate: Date = new Date();

    events: CalendarEvent [] = [
      {
        start: startOfDay(new Date()),
        title: 'An event',
        color: colors.yellow,
      },
      {
        start: addHours(startOfDay(new Date()), 2),
        end: new Date(),
        title: 'Another event',
        color: colors.blue,
      },
      {
        start: addDays(addHours(startOfDay(new Date()), 2), 2),
        end: addDays(new Date(), 2),
        title: 'And another draggble and cliquable',
        draggable: true,

        color: colors.red,
      },
    ];
  title = 'welcome to app!';

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }


}