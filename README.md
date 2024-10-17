# DMSFrontend

This is a simple Angular application that provides a frontend interface for managing documents, projects, users, and logs.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v12 or later)
* Angular CLI (v12 or later)

### Installing

1. Clone the repository to your local machine.

    ```bash
    git clone https://github.com/AngryGranny01/DMSFrontend.git
    cd DMSFrontend
    ```

2. Navigate to the project directory and install the required dependencies by running the following command:

    ```bash
    npm install
    ```

### Running the Application

1. Start the Angular development server by running the following command:

    ```bash
    ng serve
    ```

2. The server should now be running on <https://localhost:4200/>. The application will automatically reload if you change any of the source files.

### API Integration

Ensure the backend API is running and accessible at <https://localhost:8080/DMSSystemAPI`>. The frontend is configured to interact with this API for managing documents, projects, users, and logs.

### API Documentation

The backend API is documented using Swagger. Once the backend server is running, you can access the Swagger UI at:
<https://localhost:8080/DMSSystemAPI/api-docs>

### Development

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
