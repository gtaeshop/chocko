import { Component } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { addDays, addHours, startOfDay } from 'date-fns';


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
  
  <h1>{{ title }} </h1> 

  <p> Length: {{title.length}} </p > 
  
  <p>Reversed: {{ getReversed(title) }} </p> 
  <mwl-calendar-week-view
  [viewDate]="viewDate"
  [events]="events"
>
</mwl-calendar-week-view>
  `,
   styles: [] })
  

  export class AppComponent {




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
        title: 'And another',
        color: colors.red,
      },
    ];
  title = 'welcome to app!';
  getReversed(str: string) {
    let reversed = ''; 
    for (let i = str.length - 1; i >= 0; i--)
     { reversed += str.substring(i, i + 1); } 
     return reversed;
  }
}