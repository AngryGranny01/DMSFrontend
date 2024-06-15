import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private readonly keySizePBKDF2 = 256;
  private readonly iterationsPBKDF2 = 10000;

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
