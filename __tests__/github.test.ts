import {describe, expect, it} from '@jest/globals'
import * as github from '../src/github'

describe('getRelease', () => {
  it('returns latest Datalift GitHub release', async () => {
    const release = await github.getRelease('latest')
    expect(release).not.toBeNull()
    expect(release?.tag_name).not.toEqual('')
  })

  it('returns v0.1.0 Datalift GitHub release', async () => {
    const release = await github.getRelease('v0.1.0')
    expect(release).not.toBeNull()
    expect(release?.tag_name).toEqual('v0.1.0')
  })

  it('returns v0.1.0 for version range Datalift GitHub release', async () => {
    const release = await github.getRelease('~> 0.1')
    expect(release).not.toBeNull()
    expect(release?.tag_name).toEqual('v0.1.0')
  })

  it('unknown Datalift release', async () => {
    await expect(github.getRelease('foo')).rejects.toThrow(
      new Error(
        'Cannot find Datalift release foo in https://datalift.dev/static/releases.json'
      )
    )
  })
})
