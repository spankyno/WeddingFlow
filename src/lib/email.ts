// Envía email vía la API HTTP de Resend con un simple fetch — sin SDK de Node, para que
// funcione igual en local que desplegado como Cloudflare Worker.
// Requiere la variable de entorno RESEND_API_KEY (ver instrucciones en el README).
//
// Límite real del plan gratuito de Resend sin dominio propio verificado: solo se puede
// enviar a la dirección de email con la que te registraste en Resend. Para enviar a
// cualquier invitado o pareja, hay que verificar un dominio propio (gratis, pero requiere
// tener un dominio y añadir registros DNS).

const FROM_ADDRESS = "WeddingFlow <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada — email no enviado:", subject);
    return { sent: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
    });

    if (!res.ok) {
      console.error("Error al enviar email:", await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    // Un fallo de envío nunca debe romper la operación principal (ej. guardar un RSVP).
    console.error("Error al enviar email:", err);
    return { sent: false };
  }
}
