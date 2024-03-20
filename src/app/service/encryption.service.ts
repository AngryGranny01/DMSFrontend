import { Injectable } from '@angular/core';
import CryptoJS, { SHA512 } from 'crypto-js';
import { Log } from '../models/logInterface';
import forge from 'node-forge';

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
    const encryptedData = publicKeyObj.encrypt(data, 'RSA-OAEP');

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

    return decryptedData;
  }

  async decryptUserDataRSA(
    userData: Record<string, string>,
    privateKey: string
  ): Promise<Record<string, string>> {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const decryptedUserData: Record<string, string> = {};

    try {
      for (const [propertyName, value] of Object.entries(userData)) {
        // Exclude certain properties from decryption
        if (
          propertyName === 'privateKey' ||
          propertyName === 'salt' ||
          propertyName === 'userID' ||
          propertyName === 'publicKey' ||
          value === '' ||
          typeof value !== 'string'
        ) {
          decryptedUserData[propertyName] = value;
        } else {
          // Decrypt the encrypted value using the private key
          const decryptedValue = privateKeyObj.decrypt(
            forge.util.decodeUtf8(value)
          );
          // Set the decrypted value in the decryptedUserData object
          decryptedUserData[propertyName] = decryptedValue;
        }
      }
      return decryptedUserData;
    } catch (error) {
      console.error('Error decrypting userData:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async encryptUserDataRSA(
    userData: Record<string, string>,
    publicKey: string
  ): Promise<Record<string, string>> {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedUserData: Record<string, string> = {};

    try {
      for (const [propertyName, value] of Object.entries(userData)) {
        // Exclude certain properties from encryption
        if (
          propertyName === 'privateKey' ||
          propertyName === 'salt' ||
          propertyName === 'publicKey' ||
          propertyName === 'userID' ||
          value === '' ||
          typeof value !== 'string'
        ) {
          encryptedUserData[propertyName] = value;
        } else {
          encryptedUserData[propertyName] = forge.util.encode64(
            publicKeyObj.encrypt(value, 'RSA-OAEP')
          );
        }
      }
      return encryptedUserData;
    } catch (error) {
      console.error('Error encrypting userData:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  /**
   * You use the secret key K 128 bits as seed for a Pseudorandom Number Generator.
   * The PRNG is deterministic (same seed implies same output sequence) and
   * produces random bits.
   */

  generateRSAKeyPairFromHash(hashedPassword: string): {
    publicKey: string;
    privateKey: string;
  } {
    // Convert hashed password to bytes
    const passwordBytes = forge.util.hexToBytes(hashedPassword);

    // Create PRNG with seeded bytes
    const prng = {
      seed: function (needed: number) {
        return passwordBytes;
      },
    };

    // Generate RSA key pair
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, prng });

    // Convert keys to PEM format
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

    return { publicKey, privateKey };
  }
}
