
import { promisify } from 'util'
import { promises as fsPromises, existsSync, mkdir, renameSync } from 'fs'

import rimraf from 'rimraf'

import { inspect, console } from '../../../core'

const rimrafP = promisify(rimraf);

export function cleanupFolderPromise(path, tmpPath) {
  return new Promise(async (resolve, reject) => {
    if (existsSync(path)) {
      try {
        renameSync(path, tmpPath);
      } catch (error) {
        return reject(error)
      }

      // rimrafP(tmpPath);
      fsPromises.rm(tmpPath, {
        force: true,
        recursive: true
      })
    }

    process.nextTick(() => {
      mkdir(path, {
        recursive: true
      }, (error) => {
        if (error) {
          return reject(error);
        }
        resolve()
      })
    })
  })
  // .catch(error => {
  //   console.error(error)
  // })
}