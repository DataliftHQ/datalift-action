import * as path from 'path'
import * as context from './context'
import * as datalift from './datalift'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs()
    const bin = await datalift.install(inputs.version)
    core.info(`Datalift ${inputs.version} installed successfully`)
    if (inputs.installOnly) {
      const dataliftDir = path.dirname(bin)
      core.addPath(dataliftDir)
      core.debug(`Added ${dataliftDir} to PATH`)
      return
    } else if (!inputs.args) {
      core.setFailed('args input required')
      return
    }
    if (inputs.workdir && inputs.workdir !== '.') {
      core.info(`Using ${inputs.workdir} as working directory`)
      process.chdir(inputs.workdir)
    }
    await exec.exec(`${bin} ${inputs.args}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
