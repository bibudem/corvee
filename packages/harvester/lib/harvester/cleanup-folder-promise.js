
import { promisify } from 'util'
import fs, { promises as fsPromises } from 'fs'

import rimraf from 'rimraf'

import { inspect, console } from '../../../core'

const rimrafP = promisify(rimraf);

export function cleanupFolderPromise(path, tmpPath) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path)) {
      try {
        await fsPromises.rename(path, tmpPath);
      } catch (error) {
        console.error(error)
      }

      rimrafP(tmpPath);
    }

    process.nextTick(() => {
      fs.mkdir(path, {
        recursive: true
      }, (error) => {
        if (error) {
          return reject(error);
        }
        resolve()
      })
    })
  })
    .catch(error => {
      console.error(error)
    })
}