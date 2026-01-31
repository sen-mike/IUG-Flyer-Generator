
import { GoogleGenAI } from "@google/genai";

const UNIVERSITY_NAME = "Institut Universitaire La Grace (IUG Ex-ECO.TE.S)";
const OFFICIAL_WEBSITE = "www.iuguniversity.org";
const OFFICIAL_EMAIL = "info@iuguniversity.org";
const OFFICIAL_PHONES = "+2290198223211, +2290153321260";

export async function generateIUGFlyer(
  description: string,
  userImages: { data: string; mimeType: string }[],
  logoImage: { data: string; mimeType: string } | null,
  additionalPhones: string = "",
  language: 'English' | 'French' = 'French',
  backgroundColor: string = "Blue and White"
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageCount = userImages.length;

  const systemInstruction = `
    ROLE: Professional university flyer image generator for ${UNIVERSITY_NAME}.
    
    CORE OBJECTIVE:
    Produce a single, clean, professional flyer image using:
    1. EXACTLY ${imageCount} image(s) uploaded by the user. Do NOT duplicate, mirror, or invent images.
    2. LANGUAGE: Strictly ${language}. All text must be in ${language}.
    3. THEME: ${description}
    4. BACKGROUND COLOR: ${backgroundColor}. 
       - Apply soft gradients, smooth color blends, or subtle geometric shapes using ONLY these colors.
       - Do NOT use noisy textures or photo backgrounds.
       - Ensure high readability.
    
    MANDATORY BRANDING RULES:
    - TOP SECTION: University Name "${UNIVERSITY_NAME}" (Text in Blue and White) and the official logo.
    - BOTTOM SECTION: 
      Website: ${OFFICIAL_WEBSITE}
      Email: ${OFFICIAL_EMAIL}
      Phone: ${OFFICIAL_PHONES} ${additionalPhones ? ', ' + additionalPhones : ''}
    
    CONSTRAINTS:
    - Use ONLY the provided images.
    - Academic, professional visual style.
    - Clear hierarchy and excellent readability.
    - Output ONLY the final flyer image.
  `;

  const parts: any[] = [{ text: systemInstruction }];

  // Add the official logo if available
  if (logoImage) {
    parts.push({
      inlineData: {
        data: logoImage.data,
        mimeType: logoImage.mimeType
      }
    });
  }

  // Add user images - strictly used as requested
  userImages.forEach((img) => {
    parts.push({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType
      }
    });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "3:4"
      }
    }
  });

  let imageUrl = "";
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
    if (imageUrl) break;
  }

  if (!imageUrl) {
    throw new Error("Failed to generate flyer image. Ensure images are valid and try again.");
  }

  return imageUrl;
}
