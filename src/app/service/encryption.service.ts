import { Injectable } from '@angular/core';
import CryptoJS, { SHA512 } from 'crypto-js';
import { Log } from '../models/logInterface';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private keySizePBKDF2 = 256;
  private iterationsPBKDF2 = 10000;
  //TODO: Encrypt User Data, Project Data, update Project Key
  //--------------------------- Project Encryption ------------------------//
  encryptProjectData(project: any, userIDs: any[], projectKey: string) {
    const encryptedProject = {
      projectName: this.encryptUsingAES256(project.projectName, projectKey),
      projectDescription: this.encryptUsingAES256(
        project.projectDescription,
        projectKey
      ),
      projectKey: projectKey,
      projectEndDate: this.encryptUsingAES256(
        project.projectEndDate,
        projectKey
      ),
      managerID: this.encryptUsingAES256(
        project.managerID.toString(),
        projectKey
      ),
      userIDs: this.encryptUserIDs(userIDs, projectKey), // Call the method to encrypt user IDs
    };
    console.log('DATE: ' + encryptedProject.projectEndDate);
    return encryptedProject;
  }

  encryptUserIDs(userIDs: any[], projectKey: string) {
    const encryptedUserIDs = userIDs.map((user) => {
      const userProjectKey = this.generateUserProjectKey(
        user.passwordHash,
        projectKey
      );
      const encryptedUserID = user.userID //encryptUsingAES256

      return { userID: encryptedUserID, projectUserKey: userProjectKey };
    });
    return encryptedUserIDs;
  }

  generateUserProjectKey(userPasswordHash: string, projectKey: string): string {
    // Generate a project-specific key for a user based on their password hash and the project key
    return this.encryptPBKDF2(userPasswordHash, projectKey);
  }

  generateProjectKey(
    adminPasswordHash: string,
    projectManagerPasswordHash: string
  ): string {
    // Generate a project-specific key based on the password hashes of the admin and project manager
    // Concatenate the password hashes and use PBKDF2 to derive the project key
    const combinedHash = adminPasswordHash + projectManagerPasswordHash;
    return this.encryptPBKDF2(combinedHash, ''); // Empty salt as we're not using salt for key generation
  }

  //--------------------------- Log Encryption ------------------------//
  encryptLogData(log: any, userProjectKey: string) {
    console.log("LOG: ", log)
    const encryptedLog = {
      projectID: this.encryptUsingAES256(log.projectID, userProjectKey),
      userID: this.encryptUsingAES256(log.userID, userProjectKey),
      activityName: this.encryptUsingAES256(log.activityName, userProjectKey),
      activityDescription: this.encryptUsingAES256(
        log.activityDescription,
        userProjectKey
      ),
      userProjectKey:userProjectKey
    };
    return encryptedLog;
  }
  //--------------------------- Encryption ---------------------------------//
  //PDKF2
  encryptPBKDF2(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySizePBKDF2 / 32,
      iterations: this.iterationsPBKDF2,
    }).toString(CryptoJS.enc.Hex);
  }

  generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  }

  //AES 256
  encryptUsingAES256(data: any, cipherKeyAES: string): string {
    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }
    let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
    let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);

    return CryptoJS.AES.encrypt(data, _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  decryptUsingAES256(data: string, cipherKeyAES: string): string {
    let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
    let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);

    let decryptedData = CryptoJS.AES.decrypt(data, _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decryptedData.toString(CryptoJS.enc.Utf8);
  }
}
