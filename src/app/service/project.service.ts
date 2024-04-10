import { Injectable } from '@angular/core';
import { Project } from '../models/projectInterface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor() { }

  private selectedProject!: Project;
  public isProjectEditMode: boolean = true;
  public showAllProjects: boolean = false;

  setSelectedProject(project: Project) {
    console.log("Selected Projects: ", project)
    this.selectedProject = project;
  }

  getSelectedProject() {
    return this.selectedProject;
  }
}
