export class NiceDate {
  constructor(
    public year: number,
    public month: number,
    public day: number,
    public hour: number,
    public minute: number,
  ) {}

  formatDate(): string {
    // Format date
    const formattedDate = `${this.formatNumber(this.day)}.${this.formatNumber(
      this.month
    )}.${this.year}`;

    return `${formattedDate}`;
  }

  formatTime(): string {
    // Format time
    const formattedTime = `${this.formatNumber(this.hour)}:${this.formatNumber(
      this.minute
    )}`;

    return `${formattedTime}`;
  }

  private formatNumber(num: number): string {
    // Add leading zero if the number is less than 10
    return num < 10 ? `0${num}` : `${num}`;
  }
}
