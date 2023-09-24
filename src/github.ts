import * as semver from 'semver'
import * as core from '@actions/core'
import * as httpm from '@actions/http-client'

export interface GitHubRelease {
  tag_name: string
}

export const getRelease = async (version: string): Promise<GitHubRelease> => {
  if (version === 'latest') {
    return getLatestRelease()
  }
  return getReleaseTag(version)
}

export const getReleaseTag = async (
  version: string
): Promise<GitHubRelease> => {
  if (version === 'nightly') {
    return {tag_name: version}
  }
  const tag: string = (await resolveVersion(version)) || version
  const url = `https://releases.datalift.dev/datalift-cli/tags.json`
  const http: httpm.HttpClient = new httpm.HttpClient('datalift-action')
  http.requestOptions = {
    maxRetries: 3,
    socketTimeout: 3 * 1000,
    headers: {
      cookie: 'preview=true'
    }
  }
  const resp: httpm.HttpClientResponse = await http.get(url)
  const body = await resp.readBody()
  const statusCode = resp.message.statusCode || 500
  if (statusCode >= 400) {
    throw new Error(
      `Failed to get Datalift release ${version} from ${url} with status code ${statusCode}: ${body}`
    )
  }
  const releases = <Array<GitHubRelease>>JSON.parse(body)
  const res = releases.filter(r => r.tag_name === tag).shift()
  if (res) {
    return res
  }
  throw new Error(`Cannot find Datalift release ${version} in ${url}`)
}

export const getLatestRelease = async (): Promise<GitHubRelease> => {
  const url = `https://releases.datalift.dev/datalift-cli/latest`
  const http: httpm.HttpClient = new httpm.HttpClient('datalift-action')
  http.requestOptions = {
    maxRetries: 3,
    socketTimeout: 3 * 1000,
    headers: {
      cookie: 'preview=true'
    }
  }
  const resp: httpm.HttpClientResponse = await http.get(url)
  const body = await resp.readBody()
  const statusCode = resp.message.statusCode || 500
  if (statusCode >= 400) {
    throw new Error(
      `Failed to get Datalift release latest from ${url} with status code ${statusCode}: ${body}`
    )
  }
  return {tag_name: body}
}

const resolveVersion = async (version: string): Promise<string | null> => {
  const allTags: Array<string> | null = await getAllTags()
  if (!allTags) {
    throw new Error(`Cannot download tags`)
  }
  core.debug(`Found ${allTags.length} tags in total`)

  return semver.maxSatisfying(allTags, version)
}

interface GitHubTag {
  tag_name: string
}

const getAllTags = async (): Promise<Array<string>> => {
  const http: httpm.HttpClient = new httpm.HttpClient('datalift-action')
  http.requestOptions = {
    maxRetries: 3,
    socketTimeout: 3 * 1000,
    headers: {
      cookie: 'preview=true'
    }
  }
  const url = `https://releases.datalift.dev/datalift-cli/tags.json`
  core.debug(`Downloading ${url}`)
  const getTags = http.getJson<Array<GitHubTag>>(url)
  return getTags.then(response => {
    if (response.result == null) {
      return []
    }
    return response.result.map(obj => obj.tag_name)
  })
}
