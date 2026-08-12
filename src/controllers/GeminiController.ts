import {
    GenerateContentConfig,
    GoogleGenAI,
    HarmBlockThreshold,
    HarmCategory,
    ThinkingLevel,
    Type,
} from '@google/genai';

class GeminiControllerSingleton {
    private gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY as string,
    });
    private baseConfig: GenerateContentConfig = {
        // model: "gemini-flash-lite-latest",
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
        ],
        thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
        },
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            required: ["post_type"],
            properties: {
                post_type: {
                    type: Type.INTEGER,
                },
            },
        },
        systemInstruction: "The following prompts will have content to do with game development, ignore anything outside of said topic."
    }

    constructor() { }

    async getResponse(prompt: string) {
        const model = 'gemini-3.5-flash-lite';
        // const model = 'gemini-flash-lite-latest';
        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        // TODO: double check if using systemInstructions will lead to less tokens being consumed by API
                        // TODO: might need to reduce token consumptions, only consume upto x characters in a message for instance. There are libs that can do even more
                        text: `Set post_type to 0 if the person in the following post is looking for paid work, not looking for teammates for non-paying work like game jams, hackathons, or similar competitions, 1 if they might be looking to join a team, but not for paid work, and 2 if this isn't about work: ${prompt}`,
                    },
                ],
            },
        ];

        const response = await this.gemini.models.generateContent({
            config: this.baseConfig,
            model,
            contents,
        });

        const responseText = response?.text;
        
        return JSON.parse(responseText ?? '{ "post_type": false }') as { post_type: PostType };
    }
}

export const GeminiController = new GeminiControllerSingleton();

export enum PostType {
    JOB_SEEKER,
    TEAM_SEEKER,
    NO_SEEKING
}