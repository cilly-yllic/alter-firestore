import { ActionArg } from '../../../internal/types/command.js'
import { AlterOptions } from '../../../internal/types/options.js'
import { Settings } from '../../../internal/types/settings.js'
import { AppClass } from '../../../internal/utils/app.js'
import { execFile } from '../../../internal/utils/fs.js'
import { bullet, table } from '../../../internal/utils/log.js'
import { getFullPath } from '../../../internal/utils/path.js'
import { IS_DEBUG } from '../../../internal/utils/process.js'

const getFilepath = (options: AlterOptions, settings: Settings) => {
  const targets = Object.entries(settings.aliases).reduce((acc: string[], [key, paths]) => {
    if (key !== options.only) {
      return acc
    }
    for (const val of paths) {
      acc.push(getFullPath(val))
    }
    return acc
  }, [])
  return targets.length ? targets : [getFullPath(options.only)]
}

const execFiles = (app: AppClass, filePaths: string[]) => {
  return Promise.all(
    filePaths.map(async filepath => {
      await execFile(app, filepath, 'up')
    })
  )
}

export const action = async ({ app, firestore: __, options, settings }: ActionArg<AlterOptions>) => {
  const filePaths = getFilepath(options, settings)
  if (!filePaths.length) {
    bullet('nothing files to alter')
  }
  if (IS_DEBUG) {
    bullet(`--- alter files: ${filePaths.length} ---`)
    table(filePaths)
    return
  }
  return execFiles(app, filePaths)
}
