const WA_BASE = 'https://graph.facebook.com/v19.0'

export class WhatsAppClient {
  constructor(
    private phoneNumberId: string,
    private token: string
  ) {}

  async sendText(to: string, text: string): Promise<void> {
    await fetch(`${WA_BASE}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
    })
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<void> {
    await fetch(`${WA_BASE}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: { link: imageUrl, caption: caption || '' },
      }),
    })
  }

  async sendInteractive(to: string, bodyText: string, buttons: { id: string; title: string }[]): Promise<void> {
    await fetch(`${WA_BASE}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: { buttons: buttons.map(b => ({ type: 'reply', reply: b })) },
        },
      }),
    })
  }
}
