export class NiceDate {
  constructor(
    public year:number,
    public month:number,
    public day:number,
    public hour:number,
    public minute:number,
 ){ }

}


export function niceDateToString(date: NiceDate): string {
    return (date.day < 10 ? "0" : "") + date.day + "." +
        (date.month < 10 ? "0" : "") + date.month + "." + date.year
        + " " + (date.hour < 10 ? "0" : "") + date.hour + ":" + (date.minute < 10 ? "0" : "") + date.minute
}


export function parseToDate(date: NiceDate): Date {
    return new Date(date.year + "-" + (date.month) + "-" + date.day + " " + date.hour + ":" + date.minute)
}
//takes a string in the format "dd.mm.yyyy hh:mm" and returns a new NiceDate object
export function stringToNiceDate(dateString: string): NiceDate {
  const parts = dateString.split(" ");
  const dateParts = parts[0].split(".");
  const timeParts = parts[1].split(":");
  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[0]);
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  return new NiceDate(year,month,day,hour,minute);
}

function copy(nd: NiceDate): NiceDate {
    return {
        year: nd.year,
        month: nd.month,
        day: nd.day,
        hour: nd.hour,
        minute: nd.minute
    } as NiceDate
}


function parseToNiceDate(date: Date) : NiceDate {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
    } as NiceDate
}


export function compeareNiceDatesOnEquality(a: NiceDate, b: NiceDate): boolean {
    return a.year == b.year
        && a.month == b.month
        && a.day == b.day
        && a.hour == b.hour
        && a.minute == b.minute
}


