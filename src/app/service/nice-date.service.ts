import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NiceDateService {

  constructor() { }

  formatDate(date: Date): string {
    if (!date) {
      return ''; // Return empty string if date is null or undefined
    }

    // Extract day, month, and year from the Date object
   
    const day = date.getDate();
    const month = date.getMonth() + 1; // Month is zero-based, so add 1
    const year = date.getFullYear();

    // Format date
    const formattedDate = `${this.formatNumber(day)}.${this.formatNumber(month)}.${year}`;

    return formattedDate;
  }

  formatTime(date: Date): string {
    if (!date) {
      return ''; // Return empty string if date is null or undefined
    }

    // Extract hours and minutes from the Date object
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Format time
    const formattedTime = `${this.formatNumber(hour)}:${this.formatNumber(minute)}`;

    return formattedTime;
  }

  private formatNumber(num: number): string {
    // Add leading zero if the number is less than 10
    return num < 10 ? `0${num}` : `${num}`;
  }
}

