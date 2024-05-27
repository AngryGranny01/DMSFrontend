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
}
