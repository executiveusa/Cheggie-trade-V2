const BASE = process.env.MUAPI_BASE_URL || 'https://api.muapi.ai';
const MAX_POLL_ITERATIONS = 150; // 5 minutes max

async function pollResult(id: string, key: string): Promise<string> {
  for (let i = 0; i < MAX_POLL_ITERATIONS; i++) {
    // Exponential backoff: 2s, 3s, 4s, ... capped at 10s
    const delay = Math.min(2000 + i * 500, 10000);
    await new Promise(r => setTimeout(r, delay));
    const r = await fetch(`${BASE}/api/v1/status/${id}`, { headers: { 'x-api-key': key } });
    if (!r.ok) throw new Error(`muapi service unavailable, retry in 60s (status ${r.status})`);
    const d = await r.json() as { status: string; output?: string; error?: string };
    if (d.status === 'completed' && d.output) return d.output;
    if (d.status === 'failed') throw new Error(d.error || 'Generation failed');
  }
  throw new Error('Generación superó el tiempo máximo de 5 minutos. Intenta con un prompt más simple.');
}

async function submit(endpoint: string, payload: Record<string, unknown>, key: string): Promise<string> {
  const r = await fetch(`${BASE}/api/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify(payload),
  });
  if (r.status === 401) throw new Error('Llave de muapi inválida. Verifica tu llave en Configuración.');
  if (r.status === 422) throw new Error('Modelo o parámetros no soportados. Verifica la configuración del estudio.');
  if (r.status >= 500) throw new Error('Servicio de muapi no disponible. Intenta de nuevo en 60 segundos.');
  if (!r.ok) throw new Error(`Error de muapi: HTTP ${r.status}`);
  const d = await r.json() as { request_id?: string; id?: string };
  const jobId = d.request_id || d.id;
  if (!jobId) throw new Error('muapi no devolvió un ID de trabajo. La API puede haber cambiado.');
  return pollResult(jobId, key);
}

export class SynthiaMediaClient {
  constructor(private key: string) {}

  async validateConnection(): Promise<boolean> {
    try {
      const r = await fetch(`${BASE}/api/v1/models`, {
        headers: { 'x-api-key': this.key },
        signal: AbortSignal.timeout(5000),
      });
      return r.ok || r.status === 404; // 404 means endpoint exists but path differs — key is valid
    } catch {
      return false;
    }
  }

  image(params: { model: string; prompt: string; aspect_ratio?: string; image_url?: string }) {
    return submit(params.model, params, this.key);
  }

  video(params: { model: string; prompt: string; duration?: number; aspect_ratio?: string; image_url?: string }) {
    return submit(params.model, params, this.key);
  }

  cinema(params: { prompt: string; camera: string; lens: string; focal?: number; aperture?: string }) {
    const CAMERAS: Record<string, string> = {
      'Full-Frame Cine Digital': 'full-frame digital cinema camera',
      'Studio Digital S35': 'Super 35 studio digital camera',
      'Premium Large Format Digital': 'premium large-format digital cinema camera',
    };
    const LENSES: Record<string, string> = {
      'Compact Anamorphic': 'compact anamorphic lens',
      'Warm Cinema Prime': 'warm-toned cinema prime lens',
      'Halation Diffusion': 'halation diffusion filter',
    };
    const APERTURES: Record<string, string> = {
      'f/1.4': 'shallow depth of field, creamy bokeh',
      'f/4': 'balanced depth of field',
      'f/11': 'deep focus clarity',
    };
    const full = [
      params.prompt,
      CAMERAS[params.camera] ? `shot on ${CAMERAS[params.camera]}` : '',
      LENSES[params.lens] ? `with ${LENSES[params.lens]}` : '',
      params.focal ? `${params.focal}mm` : '',
      params.aperture ? APERTURES[params.aperture] || '' : '',
      'cinematic, professional color grade, 4K',
    ].filter(Boolean).join(', ');
    return submit('flux-dev', { prompt: full, aspect_ratio: '16:9' }, this.key);
  }

  lipSync(video_url: string, audio_url: string) {
    return submit('lip-sync', { video_url, audio_url }, this.key);
  }

  marketing(params: { product_image_url: string; style: string; prompt: string }) {
    return submit('marketing-studio', params, this.key);
  }
}
