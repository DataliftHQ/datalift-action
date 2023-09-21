import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as context from './context'
import * as github from './github'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

export async function install(version: string): Promise<string> {
  const release: github.GitHubRelease = await github.getRelease(version)
  const filename = getFilename(context.osArch, context.osPlat, release.tag_name)
  const downloadUrl = util.format(
    'https://github.com/DataliftHQ/datalift-cli/releases/download/%s/%s',
    release.tag_name,
    filename
  )

  core.info(`Downloading ${downloadUrl}`)
  const downloadPath: string = await tc.downloadTool(downloadUrl)
  core.debug(`Downloaded to ${downloadPath}`)

  core.info('Extracting Datalift')
  let extPath: string
  if (context.osPlat == 'win32') {
    if (!downloadPath.endsWith('.zip')) {
      const newPath = downloadPath + '.zip'
      fs.renameSync(downloadPath, newPath)
      extPath = await tc.extractZip(newPath)
    } else {
      extPath = await tc.extractZip(downloadPath)
    }
  } else {
    extPath = await tc.extractTar(downloadPath)
  }
  core.debug(`Extracted to ${extPath}`)

  const cachePath: string = await tc.cacheDir(
    extPath,
    'datalift-action',
    release.tag_name.replace(/^v/, '')
  )
  core.debug(`Cached to ${cachePath}`)

  const exePath: string = path.join(
    cachePath,
    context.osPlat == 'win32' ? 'datalift.exe' : 'datalift'
  )
  core.debug(`Exe path is ${exePath}`)

  return exePath
}

const getFilename = (
  osArch: string,
  osPlat: string,
  tag_name: string
): string => {
  let arch: string
  switch (osArch) {
    case 'x64': {
      arch = 'amd64'
      break
    }
    case 'x32': {
      arch = 'i386'
      break
    }
    case 'arm': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arm_version = (process.config.variables as any).arm_version
      arch = arm_version ? 'armv' + arm_version : 'arm'
      break
    }
    default: {
      arch = osArch
      break
    }
  }
  const tag_version: string = tag_name.replace(/^v/, '')
  const platform: string =
    osPlat == 'win32' ? 'windows' : osPlat == 'darwin' ? 'darwin' : 'linux'
  const ext: string = osPlat == 'win32' ? 'zip' : 'tar.gz'

  return util.format('datalift-%s_%s_%s.%s', tag_version, platform, arch, ext)
}
