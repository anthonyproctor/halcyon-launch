"""Gemini TTS client for the Halcyon narration pipeline (used by render_pages_gemini.py).
- synth(text, voice, style) -> float32 mono audio at 24 kHz, cached on disk by hash(model, voice, style, text, take)
- key read at runtime from the macOS keychain (service gemini-api-key); never printed or written anywhere
- retries with backoff on 429 / 5xx / audio-less responses; counts audio and text tokens for the cost log
API (generateContent): POST v1beta/models/<model>:generateContent, header x-goog-api-key,
  body {contents:[{parts:[{text, speechMetadata:{style}}]}], generationConfig:{responseModalities:["AUDIO"],
  speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName}}}}}; audio comes back as inlineData audio/wav, 24 kHz mono s16.
Turn-level delivery goes in speechMetadata.style (ai.google.dev/gemini-api/docs/speech-generation: "Gemini 3.8 TTS treats the
text field strictly as a verbatim transcript"), so no bracketed directions are ever put in the text."""
import base64, hashlib, io, json, os, random, re, subprocess, threading, time, urllib.error, urllib.request, wave
import numpy as np

MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-3.8-flash-tts")
SR = 24000
CACHE = os.path.expanduser(os.environ.get("GEMINI_TTS_CACHE", "~/.cache/halcyon-gemini-tts"))
# USD per 1M tokens through 2026-12-31 (ai.google.dev/gemini-api/docs/pricing); all of these double on 2027-01-01
PRICE = {"standard": (9.00, 0.50), "batch": (4.50, 0.25)}  # (audio out, text in)
PRICE_OUT, PRICE_IN = PRICE["standard"]
# GEMINI_MODE: batch (default: Batch API, half price, its own quota, minutes per job) or live (generateContent; this account's live
# quota was 100 requests per model per day on 2026-10-11, far below one chapter, so live is only good for samples)
MODE = os.environ.get("GEMINI_MODE", "batch")
BATCH_SIZE = int(os.environ.get("GEMINI_BATCH_SIZE", "40"))
os.makedirs(CACHE, exist_ok=True)
_lock = threading.Lock()
_key = None
STATS = {"calls": 0, "cached": 0, "audio_tokens": 0, "text_tokens": 0, "cached_audio_tokens": 0, "retries": 0, "cost": 0.0, "batches": 0}


class QuotaExhausted(RuntimeError): pass
_TAKES_P = os.path.join(CACHE, "takes.json")  # base hash -> take number, when a take failed verification and was re-rolled


def _api_key():
    global _key
    if _key is None:
        _key = subprocess.check_output(["security", "find-generic-password", "-s", "gemini-api-key", "-w"]).decode().strip()
    return _key


def _load_takes():
    try: return json.load(open(_TAKES_P))
    except Exception: return {}


def base_hash(text, voice, style):
    return hashlib.sha256(json.dumps([MODEL, voice, style or "", text], ensure_ascii=False).encode()).hexdigest()[:32]


def current_take(text, voice, style):
    return _load_takes().get(base_hash(text, voice, style), 0)


def bump_take(text, voice, style):
    """Mark the current take bad: the next synth() of this exact segment makes a fresh take (and caches it)."""
    with _lock:
        t = _load_takes(); b = base_hash(text, voice, style); t[b] = t.get(b, 0) + 1
        tmp = f"{_TAKES_P}.{os.getpid()}.tmp"; json.dump(t, open(tmp, "w")); os.replace(tmp, _TAKES_P); return t[b]


def _cache_path(text, voice, style, take):
    h = hashlib.sha256(json.dumps([MODEL, voice, style or "", text, take], ensure_ascii=False).encode()).hexdigest()[:32]
    return os.path.join(CACHE, h[:2], h)


def _wav_to_float(b):
    with wave.open(io.BytesIO(b)) as w:
        sr, ch, raw = w.getframerate(), w.getnchannels(), w.readframes(w.getnframes())
    a = np.frombuffer(raw, "<i2").astype(np.float32) / 32768
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    if sr != SR:  # never seen (API returns 24 kHz), but resample linearly to be safe
        a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a).astype(np.float32)
    return a


def _request(text, voice, style):
    part = {"text": text}
    if style: part["speechMetadata"] = {"style": style}
    body = {"contents": [{"parts": [part]}], "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    delay = 4.0
    for attempt in range(10):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"x-goog-api-key": _api_key(), "Content-Type": "application/json"})
        try:
            r = json.load(urllib.request.urlopen(req, timeout=600))
            parts = (r.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
            data = next((p["inlineData"] for p in parts if "inlineData" in p), None)
            if data is None: raise RuntimeError("no audio in response: " + json.dumps(r)[:300])
            return base64.b64decode(data["data"]), r.get("usageMetadata", {})
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:600]
            if e.code == 429 and "per_day" in msg:
                raise QuotaExhausted("Gemini TTS daily request quota used up (live mode). Use GEMINI_MODE=batch. " + re.sub(r"\s+", " ", msg)[:300])
            if e.code not in (408, 429, 500, 502, 503, 504) or attempt == 9: raise RuntimeError(f"Gemini TTS HTTP {e.code}: {msg}")
            why = f"HTTP {e.code} {msg[:160]}"
        except (urllib.error.URLError, TimeoutError, ConnectionError, RuntimeError) as e:
            if attempt == 9: raise
            why = f"{type(e).__name__} {str(e)[:160]}"
        with _lock: STATS.setdefault("why", {}); k = why[:60]; STATS["why"][k] = STATS["why"].get(k, 0) + 1
        with _lock: STATS["retries"] += 1
        time.sleep(delay + random.random() * delay); delay = min(delay * 2, 120)


def synth(text, voice, style="", take=None):
    """Return (float32 audio at 24 kHz, info). Cached: a re-render of unchanged text costs nothing."""
    if take is None: take = current_take(text, voice, style)
    p = _cache_path(text, voice, style, take)
    if os.path.exists(p + ".wav"):
        meta = json.load(open(p + ".json")) if os.path.exists(p + ".json") else {}
        with _lock: STATS["cached"] += 1; STATS["cached_audio_tokens"] += meta.get("audio_tokens", 0)
        return _wav_to_float(open(p + ".wav", "rb").read()), meta
    wav, usage = _request(text, voice, style)
    meta = _store(p, wav, usage, text, voice, style, take, "standard")
    return _wav_to_float(wav), meta


def _live(p, text, voice, style, take):
    wav, usage = _request(text, voice, style); _store(p, wav, usage, text, voice, style, take, "standard")


def _store(p, wav, usage, text, voice, style, take, tier):
    at = sum(d.get("tokenCount", 0) for d in usage.get("candidatesTokensDetails", []) if d.get("modality") == "AUDIO") or usage.get("candidatesTokenCount", 0)
    tt = usage.get("promptTokenCount", 0)
    meta = {"model": MODEL, "voice": voice, "style": style, "text": text, "take": take, "audio_tokens": at, "text_tokens": tt, "tier": tier}
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p + ".wav.tmp", "wb").write(wav); os.replace(p + ".wav.tmp", p + ".wav")
    json.dump(meta, open(p + ".json", "w"), ensure_ascii=False)
    po, pi = PRICE[tier]
    with _lock: STATS["calls"] += 1; STATS["audio_tokens"] += at; STATS["text_tokens"] += tt; STATS["cost"] += at / 1e6 * po + tt / 1e6 * pi
    return meta


def _body(text, voice, style):
    part = {"text": text}
    if style: part["speechMetadata"] = {"style": style}
    return {"contents": [{"parts": [part]}], "generationConfig": {"responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}


def _http(method, url, body=None, timeout=900):
    delay = 5.0
    for attempt in range(8):
        req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                     headers={"x-goog-api-key": _api_key(), "Content-Type": "application/json"})
        try: return json.load(urllib.request.urlopen(req, timeout=timeout))
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:600]
            if e.code not in (408, 429, 500, 502, 503, 504) or attempt == 7: raise RuntimeError(f"Gemini HTTP {e.code} {method} {url.split('?')[0][-60:]}: {msg}")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt == 7: raise
        with _lock: STATS["retries"] += 1
        time.sleep(delay + random.random() * delay); delay = min(delay * 2, 120)


_BATCHES_P = os.path.join(CACHE, "batches.json")  # submitted, not yet collected: batch name -> [[cache path, text, voice, style, take], ...]
def _load_batches():
    try: return json.load(open(_BATCHES_P))
    except Exception: return {}
def _save_batches(b):
    tmp = f"{_BATCHES_P}.{os.getpid()}.tmp"; open(tmp, "w").write(json.dumps(b)); os.replace(tmp, _BATCHES_P)
def _update_batches(fn):
    """Read, change and write batches.json under a file lock, so two render jobs running at once don't drop each other's jobs."""
    import fcntl
    with open(_BATCHES_P + ".lock", "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        try: b = _load_batches(); fn(b); _save_batches(b)
        finally: fcntl.flock(lk, fcntl.LOCK_UN)


def _batch_run(items, log):
    """items: [(path, text, voice, style, take)] not in cache. Submits Batch API jobs (BATCH_SIZE requests each), polls, writes the cache.
    Jobs already submitted for the same cache paths by an earlier, interrupted run are collected instead of resubmitted.
    Returns the items that failed."""
    base = "https://generativelanguage.googleapis.com/v1beta/"
    with _lock: pend = _load_batches()
    want = {it[0]: it for it in items}; mine = {}
    for name, rows in pend.items():  # resume
        if any(r[0] in want for r in rows): mine[name] = rows
    covered = {r[0] for rows in mine.values() for r in rows}
    todo = [it for it in items if it[0] not in covered]
    for i in range(0, len(todo), BATCH_SIZE):
        chunk = todo[i:i + BATCH_SIZE]
        reqs = [{"request": _body(t, v, st), "metadata": {"key": os.path.basename(p)}} for (p, t, v, st, tk) in chunk]
        r = _http("POST", base + f"models/{MODEL}:batchGenerateContent",
                  {"batch": {"display_name": f"halcyon-tts-{int(time.time())}-{i // BATCH_SIZE}", "input_config": {"requests": {"requests": reqs}}}})
        name = r["name"]; mine[name] = [list(c) for c in chunk]
        with _lock:
            _update_batches(lambda pend: pend.__setitem__(name, mine[name])); STATS["batches"] += 1
    log(f"gemini batch: {len(todo)} new requests in {-(-len(todo) // BATCH_SIZE) if todo else 0} jobs, resuming {len(mine) - (-(-len(todo) // BATCH_SIZE) if todo else 0)} earlier jobs")
    failed, t0 = [], time.time()
    while mine:
        time.sleep(15)
        for name in list(mine):
            r = _http("GET", base + name)
            st = (r.get("metadata") or {}).get("state") or r.get("state", "")
            if not r.get("done") and not st.endswith(("SUCCEEDED", "FAILED", "CANCELLED", "EXPIRED")): continue
            rows = {os.path.basename(x[0]): x for x in mine.pop(name)}
            out = ((r.get("response") or {}).get("inlinedResponses") or {}).get("inlinedResponses") or []
            got = set()
            for o in out:
                k = (o.get("metadata") or {}).get("key"); row = rows.get(k)
                if not row: continue
                parts = (((o.get("response") or {}).get("candidates") or [{}])[0].get("content") or {}).get("parts") or []
                data = next((p_["inlineData"] for p_ in parts if "inlineData" in p_), None)
                if data is None: continue
                p, t, v, sty, tk = row
                _store(p, base64.b64decode(data["data"]), o["response"].get("usageMetadata", {}), t, v, sty, tk, "batch"); got.add(k)
            failed += [tuple(x) for k, x in rows.items() if k not in got and not os.path.exists(x[0] + ".wav")]
            with _lock: _update_batches(lambda pend: pend.pop(name, None))
            log(f"gemini batch {name.split('/')[-1][:10]} {st}: {len(got)}/{len(rows)} ok, {len(mine)} jobs left, {int(time.time() - t0)}s")
    return [it for it in failed if it[0] in want]


def synth_many(items, workers=6, log=lambda m: None):
    """items: iterable of (text, voice, style). Fills the cache for all of them (batch or live per GEMINI_MODE); returns {item: audio}."""
    items = list(dict.fromkeys(items)); need = []; paths = {}
    for (t, v, st) in items:
        tk = current_take(t, v, st); p = _cache_path(t, v, st, tk); paths[(t, v, st)] = p
        if not os.path.exists(p + ".wav"): need.append((p, t, v, st, tk))
        else:
            try: at = json.load(open(p + ".json")).get("audio_tokens", 0)
            except Exception: at = 0
            with _lock: STATS["cached"] += 1; STATS["cached_audio_tokens"] += at
    if need and MODE == "batch":
        for attempt in range(3):
            need = _batch_run(need, log)
            if not need: break
            log(f"gemini batch: {len(need)} requests came back without audio (a job can report SUCCEEDED with every request still pending, seen 2026-10-11 after ~1,460 batch requests in a day), resubmitting")
    if need:  # live mode, or batch leftovers
        import concurrent.futures as cf
        with cf.ThreadPoolExecutor(workers) as ex: list(ex.map(lambda it: _live(*it), need))
    return {it: _wav_to_float(open(paths[it] + ".wav", "rb").read()) for it in items}


def cost(audio_tokens, text_tokens, tier="standard"):
    po, pi = PRICE[tier]; return audio_tokens / 1e6 * po + text_tokens / 1e6 * pi


def stats_line(label=""):
    s = STATS
    return (f"gemini {label} model={MODEL} calls={s['calls']} cached={s['cached']} retries={s['retries']} "
            f"batches={s['batches']} audio_tokens={s['audio_tokens']} text_tokens={s['text_tokens']} est_cost=${s['cost']:.4f} "
            f"(at standard rates ${cost(s['audio_tokens'], s['text_tokens']):.4f}) "
            f"(cache saved {s['cached_audio_tokens']} audio tokens, ${cost(s['cached_audio_tokens'], 0):.4f})"
            + (f" retry_reasons={json.dumps(s.get('why', {}))}" if s.get("why") else ""))


def log_usage(label):
    line = time.strftime("%Y-%m-%d %H:%M:%S ") + stats_line(label)
    with open(os.path.join(CACHE, "usage.log"), "a") as f: f.write(line + "\n")
    return line


def clean(a, pad=0.04):
    """Trim leading/trailing silence (keep a short pad) and bring voiced loudness to a common level across voices."""
    if not len(a): return a
    fr = 240; n = len(a) // fr
    if n < 2: return a
    e = np.sqrt((a[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12)
    thr = max(0.004, e.max() * 0.02)
    on = np.where(e > thr)[0]
    if not len(on): return a
    s = max(0, on[0] * fr - int(SR * pad)); t = min(len(a), (on[-1] + 1) * fr + int(SR * pad))
    a = a[s:t]
    voiced = e[on]; rms = float(np.sqrt((voiced ** 2).mean()))
    g = min(3.0, max(0.5, 0.09 / max(rms, 1e-4)))  # about -21 dBFS voiced RMS
    a = a * g; pk = float(np.abs(a).max())
    if pk > 0.97: a = a * (0.97 / pk)
    return a.astype(np.float32)
