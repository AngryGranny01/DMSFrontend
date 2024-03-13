import { Injectable } from '@angular/core';
import { Project } from '../models/projectInterface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor() { }

  private selectedProject!: Project;



  setSelectedProject(project: Project) {
    this.selectedProject = project;
  }

  getSelectedProject() {
    return this.selectedProject;
  }
}
