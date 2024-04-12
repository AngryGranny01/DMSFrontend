import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NiceDateService {
  constructor() {}

  /**
   * Formats a Date object into a string with the format "DD.MM.YYYY".
   * @param date The date to format.
   * @returns The formatted date string or an empty string if the input date is null or undefined.
   */
  formatDate(date: Date): string {
    if (!date) {
      return '';
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${this.formatNumber(day)}.${this.formatNumber(
      month
    )}.${year}`;

    return formattedDate;
  }

  /**
   * Formats a Date object into a string with the format "HH:MM".
   * @param date The date to format.
   * @returns The formatted time string or an empty string if the input date is null or undefined.
   */
  formatTime(date: Date): string {
    if (!date) {
      return '';
    }

    const hour = date.getHours();
    const minute = date.getMinutes();

    const formattedTime = `${this.formatNumber(hour)}:${this.formatNumber(
      minute
    )}`;

    return formattedTime;
  }

  /**
   * Formats a number with a leading zero if it's less than 10.
   * @param num The number to format.
   * @returns The formatted number string.
   */
  private formatNumber(num: number): string {
    // Add leading zero if the number is less than 10
    return num < 10 ? `0${num}` : `${num}`;
  }
}
