import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {

  // private messageSource = new BehaviorSubject('default message');
  // currentMessage = this.messageSource.asObservable();
  data: any;
  origin: string;
  constructor() { 
  	this.data = {};
  	this.origin = 'DataService';
  }
  setData(data, origin): void {
  	this.data = data;
  	this.origin = origin;
  }
  getData(): any {
  	return this.data;
  }
  getOrigin(): string {
  	return this.origin;
  }
  // changeMessage(message: string) {
  //   this.messageSource.next(message)
  // }

}