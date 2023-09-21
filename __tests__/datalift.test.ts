import {describe, expect, it} from '@jest/globals'
import * as fs from 'fs'
import * as datalift from '../src/datalift'
import rewire from 'rewire'

describe('install', () => {
  it('acquires v0.1.0 version of Datalift', async () => {
    const bin = await datalift.install('v0.1.0')
    expect(fs.existsSync(bin)).toBe(true)
  }, 100000)

  it('acquires latest version of Datalift', async () => {
    const bin = await datalift.install('latest')
    expect(fs.existsSync(bin)).toBe(true)
  }, 100000)
})

describe('getFilename', () => {
  const app = rewire('../src/datalift')
  const getFilename = app.__get__('getFilename')

  console.log('reached')
  const testCases = [
    {q: ['x64', 'darwin', 'v0.1.0'], r: 'datalift-0.1.0_darwin_amd64.tar.gz'},
    {q: ['arm64', 'darwin', 'v0.1.0'], r: 'datalift-0.1.0_darwin_arm64.tar.gz'},
    {q: ['x64', 'linux', 'v0.1.0'], r: 'datalift-0.1.0_linux_amd64.tar.gz'},
    {q: ['arm', 'linux', 'v0.1.0'], r: 'datalift-0.1.0_linux_arm.tar.gz'},
    {q: ['arm64', 'linux', 'v0.1.0'], r: 'datalift-0.1.0_linux_arm64.tar.gz'},
    {q: ['x32', 'linux', 'v0.1.0'], r: 'datalift-0.1.0_linux_i386.tar.gz'},
    {q: ['x64', 'win32', 'v0.1.0'], r: 'datalift-0.1.0_windows_amd64.zip'},
    {q: ['arm64', 'win32', 'v0.1.0'], r: 'datalift-0.1.0_windows_arm64.zip'},
    {q: ['x32', 'win32', 'v0.1.0'], r: 'datalift-0.1.0_windows_i386.zip'}
  ]

  for (let i = 0; i < testCases.length; i++) {
    const {q, r} = testCases[i]

    it(`arch: ${q[0]}, platform: ${q[1]}, version: ${q[2]}`, async () => {
      const actual: string = getFilename(...q)
      expect(actual).not.toBeNull()
      expect(actual).toEqual(r)
    }, 100000)
  }
})
