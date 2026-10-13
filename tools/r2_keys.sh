#!/bin/zsh
# Save the Cloudflare R2 credentials to the macOS keychain (account "halcyon"), one at a time from the clipboard.
# Usage: zsh tools/r2_keys.sh   Then for each prompt: copy the value in Cloudflare, come back, press Return.
# Values are never printed. Each one is checked for the expected shape before it's saved.
save(){ # service, label, regex, hint
  while true; do
    print -n "\nCopy the $2 in Cloudflare, then press Return here... "; read -r _
    local v; v=$(pbpaste | tr -d '[:space:]')
    if [[ $v =~ $3 ]]; then
      security add-generic-password -U -a halcyon -s $1 -w "$v" && print "Saved $2 (${#v} characters)."; return
    fi
    print "That doesn't look like the $2 ($4). Your clipboard has ${#v} characters. Copy it again and press Return."
  done
}
print "Saving R2 keys to your keychain. Nothing you copy is shown on screen."
save r2-access-key-id     "Access Key ID"     '^[0-9a-f]{32}$'                                   "32 letters and numbers"
save r2-secret-access-key "Secret Access Key" '^[0-9a-f]{64}$'                                   "64 letters and numbers"
save r2-endpoint          "S3 endpoint URL"   '^https://[0-9a-f]{32}\.r2\.cloudflarestorage\.com/?$' "starts https:// and ends .r2.cloudflarestorage.com"
print "\nAll three saved. Tell Claude you're done."
