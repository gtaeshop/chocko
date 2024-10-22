import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimetableService {
  private jsonUrl = 'assets/timetable.json'; // Path to your JSON file

  constructor(private http: HttpClient) {}

  getTimetable() {
    return this.http.get(this.jsonUrl);
  }

  updateTimetable(timetableData: any) {
    // You can mock the update here or connect to a backend API
    return this.http.put(this.jsonUrl, timetableData);
  }
}
