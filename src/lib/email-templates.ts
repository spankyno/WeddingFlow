export function rsvpNotificationForOwnerEmail(params: {
  eventTitle: string;
  guestName: string;
  willAttend: boolean;
  companionsCount: number;
  dietaryRestrictions?: string;
  message?: string;
}) {
  const { eventTitle, guestName, willAttend, companionsCount, dietaryRestrictions, message } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>${willAttend ? "✅ Nueva confirmación" : "❌ Nueva respuesta (no asistirá)"}</h2>
      <p><strong>${guestName}</strong> ha respondido a la invitación de <strong>${eventTitle}</strong>.</p>
      ${willAttend ? `<p>Acompañantes: ${companionsCount}</p>` : ""}
      ${dietaryRestrictions ? `<p>Restricciones alimentarias: ${dietaryRestrictions}</p>` : ""}
      ${message ? `<p>Mensaje: "${message}"</p>` : ""}
      <p style="color:#888; font-size:12px; margin-top:24px;">WeddingFlow</p>
    </div>
  `;
}

export function rsvpConfirmationForGuestEmail(params: { eventTitle: string; guestName: string; willAttend: boolean }) {
  const { eventTitle, guestName, willAttend } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>${willAttend ? "¡Gracias por confirmar!" : "Hemos recibido tu respuesta"}</h2>
      <p>Hola ${guestName},</p>
      <p>${
        willAttend
          ? `Hemos recibido tu confirmación de asistencia a <strong>${eventTitle}</strong>. ¡Os esperamos con muchas ganas!`
          : `Hemos recibido tu respuesta para <strong>${eventTitle}</strong>. Sentimos que no puedas acompañarnos.`
      }</p>
      <p style="color:#888; font-size:12px; margin-top:24px;">WeddingFlow</p>
    </div>
  `;
}

export function collaboratorInviteEmail(params: { eventTitle: string; inviterEmail: string; acceptUrl: string }) {
  const { eventTitle, inviterEmail, acceptUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>Te han invitado a colaborar</h2>
      <p>${inviterEmail} te ha invitado a colaborar en la organización de <strong>${eventTitle}</strong> en WeddingFlow.</p>
      <p><a href="${acceptUrl}" style="display:inline-block; background:#1c1c1c; color:#fff; padding:10px 20px; border-radius:24px; text-decoration:none;">Ver evento</a></p>
      <p style="color:#888; font-size:12px; margin-top:24px;">
        Si todavía no tienes cuenta en WeddingFlow, regístrate con este mismo email y se
        vinculará automáticamente.
      </p>
    </div>
  `;
}

export function rsvpReminderEmail(params: { eventTitle: string; guestName: string; invitationUrl: string }) {
  const { eventTitle, guestName, invitationUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>¡Ya casi es el gran día!</h2>
      <p>Hola ${guestName},</p>
      <p>
        <strong>${eventTitle}</strong> es dentro de muy poco y todavía no hemos recibido tu
        confirmación de asistencia. ¿Nos ayudas a confirmarla?
      </p>
      <p><a href="${invitationUrl}" style="display:inline-block; background:#1c1c1c; color:#fff; padding:10px 20px; border-radius:24px; text-decoration:none;">Confirmar asistencia</a></p>
      <p style="color:#888; font-size:12px; margin-top:24px;">WeddingFlow</p>
    </div>
  `;
}

export function thankYouEmail(params: { eventTitle: string; guestName: string }) {
  const { eventTitle, guestName } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>¡Gracias por celebrarlo con nosotros!</h2>
      <p>Hola ${guestName},</p>
      <p>Gracias de corazón por acompañarnos en <strong>${eventTitle}</strong>. Fue un día muy especial gracias a vosotros.</p>
      <p style="color:#888; font-size:12px; margin-top:24px;">WeddingFlow</p>
    </div>
  `;
}
