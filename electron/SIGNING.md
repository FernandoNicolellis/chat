# Windows Code Signing (Electron Builder)

This project supports two build modes:

- `npm run build`: unsigned/local build allowed
- `npm run build:signed`: signing required (`forceCodeSigning=true`)

## Prerequisites

- A valid Windows code-signing certificate (`.pfx`)
- Certificate password

## Build a signed installer (PowerShell)

From the `electron` folder:

```powershell
$env:WIN_CSC_LINK="C:\path\to\your-certificate.pfx"
$env:WIN_CSC_KEY_PASSWORD="your-pfx-password"
npm run build:signed
```

## Optional: use base64 cert content instead of file path

`WIN_CSC_LINK` can also be a base64-encoded certificate string.

## Verify signature

```powershell
Get-AuthenticodeSignature ".\dist\ChatPro Setup 1.0.0.exe" | Format-List Status,StatusMessage,SignerCertificate
```

Expected `Status`: `Valid` (for signed build).
