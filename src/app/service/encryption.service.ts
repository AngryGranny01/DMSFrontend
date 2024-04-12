import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import forge from 'node-forge';

import { User } from '../models/userInterface';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private readonly keySizePBKDF2 = 256;
  private readonly iterationsPBKDF2 = 10000;

  //--------------------------- Project Encryption ------------------------//

  /**
   * Encrypts user IDs using project key.
   * @param userIDs The user IDs to encrypt.
   * @param projectKey The project key.
   * @returns An array of encrypted user IDs and their respective project user keys.
   */
  encryptUserIDs(
    userIDs: any[],
    projectKey: string
  ): { userID: string; projectUserKey: string }[] {
    return userIDs.map((user) => {
      const userProjectKey = this.generateUserProjectKey(
        user.passwordHash,
        projectKey
      );
      const encryptedUserID = this.encryptUsingAES256(
        user.userID,
        userProjectKey
      );
      return { userID: encryptedUserID, projectUserKey: userProjectKey };
    });
  }

  /**
   * Generates a project-specific key for a user.
   * @param userPasswordHash The user's password hash.
   * @param projectKey The project key.
   * @returns The generated user project key.
   */
  generateUserProjectKey(userPasswordHash: string, projectKey: string): string {
    return this.getPBKDF2Key(userPasswordHash, projectKey);
  }

  /**
   * Generates a project key based on admin and project manager password hashes.
   * @param adminPasswordHash The admin's password hash.
   * @param projectManagerPasswordHash The project manager's password hash.
   * @returns The generated project key.
   */
  generateProjectKey(
    adminPasswordHash: string,
    projectManagerPasswordHash: string
  ): string {
    const combinedHash = adminPasswordHash + projectManagerPasswordHash;
    return this.getPBKDF2Key(combinedHash, '');
  }

  //--------------------------- PDKF2 ---------------------------------//

  /**
   * Generates a PBKDF2 key.
   * @param password The password.
   * @param salt The salt.
   * @returns The generated PBKDF2 key.
   */
  getPBKDF2Key(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySizePBKDF2 / 32,
      iterations: this.iterationsPBKDF2,
    }).toString(CryptoJS.enc.Hex);
  }

  /**
   * Generates a random salt.
   * @returns The generated salt.
   */
  generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  }

  //--------------------------- AES 256 ---------------------------------//

  /**
   * Encrypts data using AES-256.
   * @param data The data to encrypt.
   * @param cipherKeyAES The AES cipher key.
   * @returns The encrypted data.
   */
  encryptUsingAES256(data: any, cipherKeyAES: string): string {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    const _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
    const _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);

    return CryptoJS.AES.encrypt(data, _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  /**
   * Decrypts data using AES-256.
   * @param data The data to decrypt.
   * @param cipherKeyAES The AES cipher key.
   * @returns The decrypted data.
   */
  decryptUsingAES256(data: string, cipherKeyAES: string): string {
    const _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
    const _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);

    const decryptedData = CryptoJS.AES.decrypt(data, _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decryptedData.toString(CryptoJS.enc.Utf8);
  }

  //--------------------------- RSA ---------------------------------//

  /**
   * Encrypts data using RSA.
   * @param data The data to encrypt.
   * @param publicKey The RSA public key.
   * @returns The encrypted data.
   */
  encryptRSA(data: string, publicKey: string): string {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedData = publicKeyObj.encrypt(
      forge.util.encodeUtf8(data),
      'RSA-OAEP'
    );
    return forge.util.encode64(encryptedData);
  }

  /**
   * Decrypts data using RSA.
   * @param encryptedData The data to decrypt.
   * @param privateKey The RSA private key.
   * @returns The decrypted data.
   */
  decryptRSA(encryptedData: string, privateKey: string): string {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const encryptedDataBytes = forge.util.decode64(encryptedData);
    const decryptedData = privateKeyObj.decrypt(encryptedDataBytes, 'RSA-OAEP');
    return forge.util.decodeUtf8(decryptedData);
  }

  /**
   * Generates an RSA key pair from a hash.
   * @param pdkf2Password The PBKDF2 password.
   * @returns The generated RSA key pair.
   */
  generateRSAKeyPairFromHash(pdkf2Password: string): {
    publicKey: string;
    privateKey: string;
  } {
    const secret = forge.util.hexToBytes(pdkf2Password);
    const rand = forge.random.createInstance();
    rand.seedFileSync = (needed) => {
      let seed = '';
      for (let i = 0; i < needed; i++) {
        seed += secret[i % secret.length];
      }
      return seed;
    };
    const keyPair = forge.pki.rsa.generateKeyPair({
      bits: 2048,
      e: 0x10001,
      prng: rand,
    });
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
    return { publicKey, privateKey };
  }

  //--------------------------- User Data Encryption/Decryption ---------------------------------//

  /**
   * Decrypts user data.
   * @param userData The encrypted user data.
   * @param privateKey The user's private key.
   * @param publicKey The user's public key.
   * @returns The decrypted user data.
   */
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

  /**
   * Encrypts user data.
   * @param userData The user data to encrypt.
   * @param publicKey The user's public key.
   * @returns The encrypted user data.
   */
  encryptUserData(userData: any, publicKey: string): any {
    const { userID, passwordHash, salt } = userData;
    const encryptedUserName = this.encryptRSA(userData.userName, publicKey);
    const encryptedFirstName = this.encryptRSA(userData.firstName, publicKey);
    const encryptedLastName = this.encryptRSA(userData.lastName, publicKey);
    const encryptedEmail = this.encryptRSA(userData.email, publicKey);
    const encryptedOrgEinheit = this.encryptRSA(userData.orgEinheit, publicKey);
    const encryptedRole = this.encryptRSA(userData.role, publicKey);
    const encryptedPasswordHash = passwordHash
      ? this.encryptRSA(passwordHash, publicKey)
      : '';
    return {
      userID,
      userName: encryptedUserName,
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      email: encryptedEmail,
      orgEinheit: encryptedOrgEinheit,
      role: encryptedRole,
      passwordHash: encryptedPasswordHash,
      salt,
      publicKey,
    };
  }

  //--------------------------- Helper Functions ---------------------------------//

  /**
   * Decrypts the user role.
   * @param role The encrypted role.
   * @returns The decrypted role.
   */
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
