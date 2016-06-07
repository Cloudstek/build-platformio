'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import fs from 'fs';
import ini from 'ini';
import path from 'path';
import {clone, isPioProject} from './utils';

const ENV_NAME_PREFIX = 'env:';

export class PlatformIOBuildProvider {
  constructor(cwd) {
    this.cwd = cwd;
    this.platformioIniPath = path.join(this.cwd, 'platformio.ini');
    this.title = 'PlatformIO';
    this.targetNamePrefix = this.title + ': ';

    this.targetsBaseSettings = [
      {
        name: 'Build',
        args: ['run'],
        keymap: 'ctrl-alt-b',
      },
      {
        name: 'Clean',
        args: ['run', '--target', 'clean'],
        keymap: 'ctrl-alt-c',
      },
      {
        name: 'Upload',
        args: ['run', '--target', 'upload'],
        keymap: 'ctrl-alt-u',
      },
      {
        name: 'Upload using Programmer',
        args: ['run', '--target', 'program'],
      },
      {
        name: 'Upload SPIFFS image',
        args: ['run', '--target', 'uploadfs'],
      }
    ];
  }

  getNiceName() {
    return this.title;
  }

  isEligible() {
    return isPioProject(this.cwd);
  }

  settings() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.platformioIniPath, (err, data) => {
        if (err) {
          reject(err);
        }
        let settings = this.prepareSettings(this.targetsBaseSettings);

        const envs = [];
        const boards = {};
        const config = ini.parse(data.toString());
        for (const section of Object.keys(config)) {
          if (section.startsWith(ENV_NAME_PREFIX)) {
            const envName = section.slice(ENV_NAME_PREFIX.length);
            envs.push(envName);
            boards[envName] = config[section].board;
          }
        }

        if (envs.length > 0) {
          let espressifFound = false;
          let atmelavrFound = false;
          for (const env of envs) {
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if ('espressif' === platform) {
              espressifFound = true;
            }
            if ('atmelavr' === platform) {
              atmelavrFound = true;
            }
          }
          if (!espressifFound) {
            settings = settings.filter(argsDoNotContain('uploadfs'));
          }
          if (!atmelavrFound) {
            settings = settings.filter(argsDoNotContain('program'));
          }
        }

        if (envs.length > 1) {
          for (const env of envs) {
            let envSettings = this
              .prepareSettings(this.targetsBaseSettings)
              .map(makeEnvSpecificTarget(env));
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if ('espressif' !== platform) {
              envSettings = envSettings.filter(argsDoNotContain('uploadfs'));
            }
            if ('atmelavr' !== platform) {
              envSettings = envSettings.filter(argsDoNotContain('program'));
            }

            settings = settings.concat(envSettings);
          }
        }

        if (atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
          settings = settings.map(assignHooks);
        }

        resolve(settings);
      });
    });

    function makeEnvSpecificTarget(env) {
      return function(base) {
        const item = clone(base);
        item.name += ` (env:${env})`;
        item.args.push('--environment');
        item.args.push(env);
        delete item.keymap;
        delete item.atomCommandName;
        return item;
      };
    }

    function argsDoNotContain(arg) {
      return function(item) {
        return item.args.indexOf(arg) === -1;
      };
    }
  }

  prepareSettings(baseSettings) {
    return baseSettings.map(base => {
      const item = clone(base);
      item.name = this.targetNamePrefix + base.name;
      item.exec = 'platformio';
      item.sh = false;
      item.env = Object.create(process.env);
      item.env.PLATFORMIO_FORCE_COLOR = 'true';
      item.env.PLATFORMIO_DISABLE_PROGRESSBAR = 'true';
      item.env.PLATFORMIO_SETTING_ENABLE_PROMPTS = 'false';
      item.errorMatch = [
        '\n\\x1B\\[31m(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+)'
      ];
      item.atomCommandName = `platformio-ide:target:${base.name.toLowerCase()}-${this.cwd}`;

      return item;
    });
  }
}
