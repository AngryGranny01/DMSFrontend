import { Injectable } from '@angular/core';
import CryptoJS, { SHA512 } from 'crypto-js';
import { Log } from '../models/logInterface';
import forge from 'node-forge';
import { User } from '../models/userInterface';
import { Role } from '../models/role';

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
    return encryptedProject;
  }

  encryptUserIDs(userIDs: any[], projectKey: string) {
    const encryptedUserIDs = userIDs.map((user) => {
      const userProjectKey = this.generateUserProjectKey(
        user.passwordHash,
        projectKey
      );
      const encryptedUserID = user.userID; //encryptUsingAES256

      return { userID: encryptedUserID, projectUserKey: userProjectKey };
    });
    return encryptedUserIDs;
  }

  generateUserProjectKey(userPasswordHash: string, projectKey: string): string {
    // Generate a project-specific key for a user based on their password hash and the project key
    return this.getPBKDF2Key(userPasswordHash, projectKey);
  }

  generateProjectKey(
    adminPasswordHash: string,
    projectManagerPasswordHash: string
  ): string {
    // Generate a project-specific key based on the password hashes of the admin and project manager
    // Concatenate the password hashes and use PBKDF2 to derive the project key
    const combinedHash = adminPasswordHash + projectManagerPasswordHash;
    return this.getPBKDF2Key(combinedHash, ''); // Empty salt as we're not using salt for key generation
  }

  //--------------------------- Log Encryption ------------------------//
  encryptLogData(log: any, userProjectKey: string) {
    const encryptedLog = {
      projectID: this.encryptUsingAES256(log.projectID, userProjectKey),
      userID: this.encryptUsingAES256(log.userID, userProjectKey),
      activityName: this.encryptUsingAES256(log.activityName, userProjectKey),
      activityDescription: this.encryptUsingAES256(
        log.activityDescription,
        userProjectKey
      ),
      userProjectKey: userProjectKey,
    };
    return encryptedLog;
  }
  //--------------------------- Encryption ---------------------------------//
  //PDKF2
  getPBKDF2Key(password: string, salt: string): string {
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
    if (typeof data !== 'string') {
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

  encryptRSA(data: string, publicKey: string): string {
    // Convert public key from PEM format
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);

    // Encrypt the data using RSA-OAEP padding
    const encryptedData = publicKeyObj.encrypt(
      forge.util.encodeUtf8(data),
      'RSA-OAEP'
    );

    // Convert the encrypted data to Base64
    return forge.util.encode64(encryptedData);
  }

  decryptRSA(encryptedData: string, privateKey: string): string {
    // Convert private key from PEM format
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);

    // Convert the encrypted data from Base64
    const encryptedDataBytes = forge.util.decode64(encryptedData);

    // Decrypt the data using RSA-OAEP padding
    const decryptedData = privateKeyObj.decrypt(encryptedDataBytes, 'RSA-OAEP');

    // Convert decrypted binary data to UTF-8 string
    return forge.util.decodeUtf8(decryptedData);
  }

  /**
   * You use the secret key K 128 bits as seed for a Pseudorandom Number Generator.
   * The PRNG is deterministic (same seed implies same output sequence) and
   * produces random bits.
   */

  generateRSAKeyPairFromHash(pdkf2Password: string): {
    publicKey: string;
    privateKey: string;
  } {
    const secret = forge.util.hexToBytes(pdkf2Password); // Convert the derived key to bytes

    const rand = forge.random.createInstance();
    rand.seedFileSync = (needed) => {
      let seed = '';

      for (let i = 0; i < needed; i++) {
        seed += secret[i % secret.length];
      }

      return seed;
    };

    // Generate RSA key pair using the custom PRNG
    const keyPair = forge.pki.rsa.generateKeyPair({
      bits: 2048,
      e: 0x10001,
      prng: rand,
    });

    // Convert keys to PEM format
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
    console.log(privateKey);
    return { publicKey, privateKey };
  }

  decryptUserData(userData: any, privateKey: string, publicKey: string): User {
    const decryptedUserID = userData.userID;
    const decryptedUserName = this.decryptRSA(userData.userName, privateKey);

    const decryptedFirstName = this.decryptRSA(userData.firstName, privateKey);
    const decryptedLastName = this.decryptRSA(userData.lastName, privateKey);
    const decryptedEmail = this.decryptRSA(userData.email, privateKey);
    const decryptedOrgEinheit = this.decryptRSA(
      userData.orgEinheit,
      privateKey
    );
    const decryptedRole = this.decryptUserRole(
      this.decryptRSA(userData.role, privateKey)
    );

    return new User(
      decryptedUserID,
      decryptedUserName,
      decryptedFirstName,
      decryptedLastName,
      privateKey,
      decryptedRole,
      decryptedEmail,
      decryptedOrgEinheit,
      userData.publicKey
    );
  }

  encryptUserData(userData: any, publicKey: string): any {
    const userID = userData.userID;
    const encryptedUserName = this.encryptRSA(userData.userName, publicKey);

    const encryptedFirstName = this.encryptRSA(userData.firstName, publicKey);
    const encryptedLastName = this.encryptRSA(userData.lastName, publicKey);
    const encryptedEmail = this.encryptRSA(userData.email, publicKey);
    const encryptedOrgEinheit = this.encryptRSA(userData.orgEinheit, publicKey);
    const encryptedRole = this.encryptRSA(userData.role, publicKey);

    let encryptedPasswordHash = ""
    if (userData.passwordHash !== '') {
      encryptedPasswordHash = this.encryptRSA(userData.passwordHash, publicKey);
    }
    const encryptedUser = {
      userID: userID,
      userName: encryptedUserName,
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      email: encryptedEmail,
      orgEinheit: encryptedOrgEinheit,
      role: encryptedRole,
      passwordHash: encryptedPasswordHash,
      salt: userData.salt,
      publicKey: publicKey,
    };
    return encryptedUser;
  }

  decryptUserRole(role: string): Role {
    switch (role) {
      case Role.ADMIN:
        return Role.ADMIN;
      case Role.MANAGER:
        return Role.MANAGER;
      default:
        return Role.USER;
    }
  }
}
