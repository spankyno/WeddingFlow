// Sube un archivo directamente desde el navegador a Cloudinary usando un "unsigned upload
// preset" (configuración pública, sin credenciales secretas expuestas). El servidor de
// WeddingFlow nunca ve el binario: solo recibe la URL resultante para guardarla en D1.
//
// Requiere las variables de entorno públicas:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
// Ver instrucciones de configuración en el README.

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super("Cloudinary no está configurado (faltan las variables de entorno).");
    this.name = "CloudinaryNotConfiguredError";
  }
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new CloudinaryNotConfiguredError();
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("No se ha podido subir la imagen. Inténtalo de nuevo.");
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}
