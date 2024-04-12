import { Injectable } from '@angular/core';
import { Project } from '../models/projectInterface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor() {}

  private selectedProject!: Project;
  public isProjectEditMode: boolean = true;
  public showAllProjects: boolean = false;

  /**
   * Sets the currently selected project.
   * @param project The project to set as selected.
   */
  setSelectedProject(project: Project): void {
    this.selectedProject = project;
  }

  /**
   * Gets the currently selected project.
   * @returns The currently selected project.
   */
  getSelectedProject(): Project {
    return this.selectedProject;
  }
}
