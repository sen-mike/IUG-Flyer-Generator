
import { GoogleGenAI } from "@google/genai";

const UNIVERSITY_NAME = "Institut Universitaire La Grâce (IUG Ex-ECO.TE.S)";
const OFFICIAL_WEBSITE = "www.iuguniversity.org";
const OFFICIAL_EMAIL = "info@iuguniversity.org";
const OFFICIAL_PHONES = "+2290198223211, +2290153321260";

export type TextPosition = 
  | 'Top (above images)' 
  | 'Bottom (below images)' 
  | 'Left of images' 
  | 'Right of images' 
  | 'Overlay - Left' 
  | 'Overlay - Center' 
  | 'Overlay - Right';

export async function generateIUGFlyer(
  description: string,
  userImages: { data: string; mimeType: string }[],
  logoImage: { data: string; mimeType: string } | null,
  additionalPhones: string = "",
  language: 'English' | 'French' = 'French',
  backgroundColor: string = "Blue and White",
  textPosition: TextPosition = 'Bottom (below images)'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageCount = userImages.length;

  const systemInstruction = `
    ROLE: Professional university flyer image generator for ${UNIVERSITY_NAME}.
    
    CORE OBJECTIVE:
    Produce a single, clean, professional flyer image.
    
    CRITICAL TEXT POSITIONING RULE:
    - Place all main flyer text (event title, description, details) ONLY in the following position: "${textPosition}".
    - Do NOT relocate text for aesthetic reasons.
    - If "Overlay" is chosen, ensure high contrast and readability.
    
    CRITICAL IMAGE HANDLING RULE:
    - Use EXACTLY ${imageCount} image(s) provided by the user. 
    - Do NOT duplicate, mirror, or invent images.
    
    LANGUAGE CONTROL:
    - Language: Strictly ${language}. All text MUST be in ${language}.
    
    UNIVERSITY NAME & ACCENT LOCK:
    - University Name: "${UNIVERSITY_NAME}" (with the 'â' in Grâce).
    - NEVER replace "â" with "a". NEVER remove accents.
    - Color: Blue and White ONLY.
    - Position: TOP SECTION ONLY.
    
    MANDATORY BRANDING RULES:
    - TOP SECTION: Logo + University Name.
    - BOTTOM SECTION: 
      Website: ${OFFICIAL_WEBSITE}
      Email: ${OFFICIAL_EMAIL}
      Phone: ${OFFICIAL_PHONES} ${additionalPhones ? ', ' + additionalPhones : ''}
    
    DESIGN STYLE:
    - Background Colors: ${backgroundColor}.
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

  // Add user images
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
