import { promises as fsPromises, existsSync, mkdir, renameSync } from 'node:fs'

import { inspect, console } from '@corvee/core'

/**
 * @param {import("fs").PathLike} path
 */
export function cleanupFolderPromise(path) {
  return new Promise(async (resolve, reject) => {

    const tmpPath = `${path}_${Date.now()}`

    if (existsSync(path)) {
      try {
        renameSync(path, tmpPath)
      } catch (error) {
        return reject(error)
      }

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
          return reject(error)
        }
        resolve()
      })
    })
  })
}