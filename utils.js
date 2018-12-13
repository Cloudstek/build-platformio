'use babel';

 import fs from 'fs';
 import path from 'path';

 export function clone(obj) {
     return JSON.parse(JSON.stringify(obj));
 }

 export function isPioProject(dir) {
     const iniPath = path.join(dir, 'platformio.ini');

     if (fs.existsSync(iniPath) === false) {
         return false;
     }

     try {
         return fs.statSync(iniPath).isFile();
     } catch (ex) {
         return false;
     }
 }
