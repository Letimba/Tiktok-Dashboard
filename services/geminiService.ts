import { TrendingHashtagsResponse } from '../types';

// Utility to convert File to a base64 inlineData part for the backend Gemini API route
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as data URL."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            mimeType: file.type,
            data: await base64EncodedDataPromise,
        },
    };
};

const generateContent = async (contents: string | { parts: any[] }, config?: any): Promise<string> => {
    try {
        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents, config }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate content');
        }
        return data.text || '';
    } catch (error) {
        console.error("Error generating content:", error);
        return "An error occurred while generating content. Please check the console.";
    }
};

export const fetchTrendingHashtags = async (
    category: string = 'Trending Now',
    query: string = ''
): Promise<TrendingHashtagsResponse> => {
    const response = await fetch('/api/gemini/trending-hashtags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, query }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch live trending hashtags');
    }

    return data as TrendingHashtagsResponse;
};

export const generateCommentReplies = async (comment: string, videoContext: string): Promise<string[]> => {
    const prompt = `You are a witty and engaging social media manager for a popular TikTok creator.
    A user commented on a video about "${videoContext}".
    The user's comment is: "${comment}"
    
    Generate 3 concise, positive, and engaging reply options. Each reply should be on a new line and start with a dash.
    Example:
    - Love this energy! Thanks for the support!
    - So glad you enjoyed it!
    - Haha you noticed! Thanks for watching.`;

    const responseText = await generateContent(prompt);
    return responseText.split('\n').map(r => r.trim().replace(/^- /, '')).filter(Boolean);
};

export const generateVideoDescription = async (videoTopic: string, videoFile?: File): Promise<string[]> => {
    const textPrompt = `You are a TikTok growth expert.
    ${videoFile ? 'Analyze this video. ' : ''}${videoTopic ? `The creator described the topic as "${videoTopic}". ` : ''}
    Generate 3 creative and engaging TikTok video descriptions.
    The descriptions should be short, punchy, and include a call-to-action. Each description should be on a new line and start with a dash.`;

    let contents: string | { parts: any[] } = textPrompt;

    if (videoFile) {
        const videoPart = await fileToGenerativePart(videoFile);
        contents = {
            parts: [{ text: textPrompt }, videoPart]
        };
    }
    
    const responseText = await generateContent(contents);
    return responseText.split('\n').map(r => r.trim().replace(/^- /, '')).filter(Boolean);
};

export const generateHashtags = async (videoTopic: string, videoFile?: File): Promise<string[]> => {
    const textPrompt = `You are a TikTok hashtag expert.
    ${videoFile ? 'Analyze this video. ' : ''}${videoTopic ? `The creator also provided the topic: "${videoTopic}". ` : ''}
    Generate a list of 20 relevant and trending TikTok hashtags for the video.
    Include a mix of broad and niche tags. The response should be a single line of space-separated hashtags, each starting with #.`;
    
    let contents: string | { parts: any[] } = textPrompt;
    
    if (videoFile) {
        const videoPart = await fileToGenerativePart(videoFile);
        contents = {
            parts: [{ text: textPrompt }, videoPart]
        };
    }

    const responseText = await generateContent(contents, {
        tools: [{ googleSearch: {} }],
    });
    return responseText.split(/\s+/).filter(h => h.startsWith('#'));
};

export const predictViralPotential = async (videoIdea: string, videoFile?: File): Promise<string> => {
    const textPrompt = `Analyze the following TikTok content for its viral potential.
    ${videoIdea ? `The creator's idea/prompt is: "${videoIdea}". ` : ''}
    ${videoFile ? 'A video file has also been provided for deeper analysis of its execution (pacing, visuals, audio choice).' : ''}
    Provide a viral score out of 100 and a detailed analysis.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            viralScore: {
                type: "INTEGER",
                description: "A score from 0 to 100 representing the video's viral potential."
            },
            analysis: {
                type: "STRING",
                description: "A short, encouraging summary of the idea's potential."
            },
            strengths: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A list of 2-3 key strengths of the video idea."
            },
            weaknesses: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A list of 2-3 potential weaknesses or challenges."
            },
            suggestions: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A list of 2-3 actionable suggestions for improvement."
            }
        }
    };

    let contents: string | { parts: any[] } = textPrompt;

    if (videoFile) {
        const videoPart = await fileToGenerativePart(videoFile);
        contents = {
            parts: [{ text: textPrompt }, videoPart]
        };
    }

    return await generateContent(contents, {
        responseMimeType: "application/json",
        responseSchema
    });
};
