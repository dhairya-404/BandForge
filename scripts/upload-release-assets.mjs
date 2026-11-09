import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

function getGitHubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    const creds = execSync('echo "protocol=https\\nhost=github.com\\n" | git credential fill', {
      encoding: 'utf-8'
    })
    const match = creds.match(/password=(.+)/)
    if (match) return match[1].trim()
  } catch {
    // ignore
  }
  return null
}

const token = getGitHubToken()
if (!token) {
  console.error('Error: No GitHub token found in GH_TOKEN or git credential manager.')
  process.exit(1)
}

const owner = 'dhairya-404'
const repo = 'Tesso'
const tag = process.argv[2] || 'v1.0.0'

const releaseRes = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Tesso-Release-Agent'
    }
  }
)
if (!releaseRes.ok) {
  console.error(`Release for tag ${tag} not found.`)
  process.exit(1)
}
const releaseData = await releaseRes.json()
const releaseId = releaseData.id

const notes = execSync(`node scripts/release-notes.mjs ${tag}`, { encoding: 'utf-8' })

console.log('Updating release metadata...')
const updateRes = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}`,
  {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Tesso-Release-Agent'
    },
    body: JSON.stringify({
      name: 'Tesso v1.0.0 - Next-Gen Multi-WAN Aggregation Platform',
      body: notes,
      draft: false,
      prerelease: false
    })
  }
)

if (!updateRes.ok) {
  console.error('Failed to update release:', await updateRes.text())
} else {
  console.log('Release metadata updated successfully!')
}

const filesToUpload = [
  { path: 'dist/tesso-1.0.0-setup.exe', contentType: 'application/octet-stream' },
  { path: 'releases/tesso.crx', contentType: 'application/x-chrome-extension' },
  { path: 'releases/tesso-chrome-extension.zip', contentType: 'application/zip' },
  { path: 'dist/latest.yml', contentType: 'text/yaml' },
  { path: 'dist/tesso-1.0.0-setup.exe.blockmap', contentType: 'application/octet-stream' }
]

for (const file of filesToUpload) {
  const filePath = path.resolve(file.path)
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`)
    continue
  }

  const fileName = path.basename(filePath)
  const fileStats = fs.statSync(filePath)
  console.log(`\nUploading ${fileName} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)...`)

  const fileBuffer = fs.readFileSync(filePath)
  const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(fileName)}`

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': file.contentType,
      'Content-Length': fileStats.size.toString(),
      'User-Agent': 'Tesso-Release-Agent'
    },
    body: fileBuffer
  })

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text()
    console.error(`Failed to upload ${fileName}:`, errorText)
  } else {
    const asset = await uploadRes.json()
    console.log(`✓ ${fileName} uploaded -> ${asset.browser_download_url}`)
  }
}

console.log('\nAll assets uploaded!')
