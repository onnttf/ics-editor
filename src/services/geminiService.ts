import { GoogleGenAI, Type } from '@google/genai'
import type { IcsEvent } from '../types'

let aiInstance: GoogleGenAI | null = null

const getAIInstance = (): GoogleGenAI | null => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
      console.warn('AI service: VITE_GEMINI_API_KEY not found. AI features will be disabled.')
      return null
    }

    try {
      aiInstance = new GoogleGenAI({ apiKey })
    } catch (error) {
      console.error('AI service: Failed to initialize GoogleGenAI:', error)
      return null
    }
  }

  return aiInstance
}

export const smartParseEvents = async (text: string): Promise<Partial<IcsEvent>[]> => {
  const ai = getAIInstance()
  if (!ai) {
    console.warn('AI smart parsing disabled: AI service not available')
    return []
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Parse the following text into one or more distinct calendar events. 
      
      CRITICAL INSTRUCTIONS:
      1. If the text contains a general title or header followed by a list of dates (e.g., "Holiday Schedule: Jan 1, Feb 14"), create a separate event for EACH date using that header as the summary.
      2. If multiple dates, times, or distinct items are detected, generate individual event objects. 
      3. Ensure 'start' and 'end' are valid ISO 8601 strings. 
      4. Default the duration to 1 hour if not specified.
      5. Use the current year if a year is missing but a month/day is present.
      
      Input Text: "${text}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'The title of the event' },
              start: { type: Type.STRING, description: 'Start time in ISO format' },
              end: { type: Type.STRING, description: 'End time in ISO format' },
              description: { type: Type.STRING, description: 'A detailed description' },
              location: { type: Type.STRING, description: 'The location' },
            },
            required: ['summary', 'start', 'end'],
          },
        },
      },
    })

    const textResult = response.text || '[]'
    const parsed = JSON.parse(textResult)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (error) {
    console.error('AI smart parsing failed:', error)
    return []
  }
}

export const suggestOptimizedDescription = async (event: IcsEvent): Promise<string> => {
  const ai = getAIInstance()
  if (!ai) {
    console.warn('AI description optimization disabled: AI service not available')
    return event.description
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Suggest a professional, concise description for a calendar event titled "${event.summary}" located at "${event.location || 'N/A'}". The current description is: "${event.description || 'N/A'}". Provide only the improved description text.`,
    })

    return response.text || event.description
  } catch (error) {
    console.error('AI description optimization failed:', error)
    return event.description
  }
}
