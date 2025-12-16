
import { GoogleGenAI } from "@google/genai";
import { FULL_MANUAL_TEXT, MANUAL_CHAPTERS } from '../constants';

// Initialize the client (Only used for Web & Map agents)
const safeApiKey = process.env.API_KEY || 'DUMMY_KEY';
const ai = new GoogleGenAI({ apiKey: safeApiKey });

// --- PURE LOCAL SEARCH ENGINE (NO NETWORK) ---

// 1. Synonym Dictionary for Fuzzy Search
// Maps colloquial user terms to formal manual keywords
const SYNONYMS: Record<string, string[]> = {
  "上班": ["工作", "时间", "考勤", "日常工作"],
  "下班": ["工作", "时间"],
  "几点": ["时间", "时刻表"],
  "带什么": ["行李", "物品", "清单", "准备", "衣物", "药品", "携带", "生活用品", "食品", "证件", "文件"],
  "拿什么": ["行李", "物品", "清单", "准备", "衣物", "药品", "携带", "生活用品", "食品", "证件", "文件"],
  "吃饭": ["餐饮", "食堂", "用餐", "伙食", "早饭", "午饭", "晚饭"],
  "饿": ["餐饮", "食堂", "食品"],
  "药": ["医疗", "疟疾", "健康", "病", "医务室", "卫生"],
  "生病": ["医疗", "疟疾", "健康", "医院", "医务室", "急救"],
  "钱": ["货币", "汇率", "现金", "银行", "法郎", "兑换"],
  "电话": ["通讯录", "联系", "紧急", "号码", "方式"],
  "联系": ["通讯录", "电话", "方式"],
  "住": ["住宿", "营地", "宿舍", "环境", "空调"],
  "车": ["交通", "司机", "出行", "派车", "摩的"],
  "行": ["交通", "出行", "车"],
  "网": ["网络", "wifi", "sim", "漫游", "信号"],
  "穿": ["衣物", "劳保", "着装", "鞋", "长袖"],
  "买": ["购物", "免税", "超市"],
  "玩": ["生活", "娱乐", "外出"],
  "安全": ["HSE", "安保", "风险", "防范", "禁忌"],
};

/**
 * Splits text into logical chunks based on Markdown Headers (#)
 * This ensures we capture full sections (e.g., the whole "Luggage" list) together.
 * 
 * IMPROVED: We now primarily split by H1/H2 (#, ##) and treat H3 (###) as children of the previous section.
 * This prevents "1.3 Packing" (H1) from being separated from "1.3.1 Company Provided" (H3).
 */
const chunkManualContent = () => {
  const chunks: { title: string, content: string, score: number, index: number }[] = [];
  let globalIndex = 0;
  
  MANUAL_CHAPTERS.forEach(chapter => {
    // Split by major headers (# or ##), but NOT by ###. 
    // We look for newline followed by # then space, or ## then space.
    // Negative lookahead (?![#]{2,}) prevents matching ###
    // Actually, simpler regex: split by \n# (H1) or \n## (H2), but keep ### attached.
    
    // We split by a newline followed by exactly one or two hashes and a space.
    const sections = chapter.content.split(/\n(?=#{1,2}\s)/);
    
    sections.forEach(section => {
      const cleanSection = section.trim();
      if (cleanSection.length > 0) {
        // Extract a specific subtitle if available, otherwise use chapter title
        let subTitle = chapter.title;
        
        // Get the first line to use as subtitle (remove # chars)
        const firstLine = cleanSection.split('\n')[0].replace(/^#+\s*/, '').trim();
        
        if (firstLine && firstLine.length < 50) {
          subTitle = `${chapter.title} - ${firstLine}`;
        }

        chunks.push({ 
          title: subTitle, 
          content: cleanSection, 
          score: 0,
          index: globalIndex++
        });
      }
    });
  });
  return chunks;
};

const MANUAL_CHUNKS = chunkManualContent();

/**
 * SERVICE 1: Manual Expert (Local Mode - Now AI Powered)
 * Uses the local Gemini model to understand and answer questions based on the manual content.
 * This provides a much more natural, conversational experience than simple keyword matching.
 */
export const askManualExpert = async (userQuery: string): Promise<string> => {
  try {
    // Construct a rich context with the full manual text
    const prompt = `
      You are an intelligent assistant for SPIC Guinea employees. 
      Your knowledge base is the following employee handbook. 
      
      **Instructions:**
      1.  **Read the user's question carefully.** Understand their intent (e.g., packing list, medical advice, safety rules).
      2.  **Search the provided handbook content below.** Find ALL relevant information across different chapters.
      3.  **Synthesize a complete answer.** Do not just list chapter titles. Extract and list the specific items, rules, or details requested.
      4.  **Order Matters:** Present the information in the same order it appears in the handbook (e.g., Chapter 1 info before Chapter 2 info).
      5.  **Be helpful and natural.** Answer like a human expert who knows the manual by heart.
      6.  **Language:** Always answer in Chinese (Simplified).
      
      **Handbook Content:**
      ${FULL_MANUAL_TEXT}
      
      **User Question:** ${userQuery}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return response.text || "抱歉，我无法根据手册内容回答您的问题。";
  } catch (error) {
    console.error("Manual Expert AI Error:", error);
    
    // Fallback to the old keyword search if the AI service fails or is offline
    // (We keep the old logic as a backup mechanism)
    return fallbackKeywordSearch(userQuery);
  }
};

/**
 * Fallback: Original Keyword Search Logic
 * Used only if the AI model call fails.
 */
const fallbackKeywordSearch = (userQuery: string): string => {
  // 1. Expand User Query with Synonyms
  const rawTerms = userQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  let expandedTerms = [...rawTerms];

  rawTerms.forEach(term => {
    // Check if user term triggers any synonyms
    Object.keys(SYNONYMS).forEach(key => {
      if (term.includes(key)) {
        expandedTerms = [...expandedTerms, ...SYNONYMS[key]];
      }
    });
  });

  // Remove duplicates
  expandedTerms = [...new Set(expandedTerms)];

  if (expandedTerms.length === 0) return "请提供更具体的关键词，例如“疫苗”、“航班”或“紧急电话”。";

  // 2. Score Chunks
  const scored = MANUAL_CHUNKS.map(chunk => {
    let score = 0;
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();
    
    expandedTerms.forEach(term => {
      // Title Match (High Weight): The section is literally about this topic
      if (titleLower.includes(term)) score += 15;
      
      // Content Match (Medium Weight): The term appears in the text
      // We count occurrences to boost relevance
      const regex = new RegExp(term, 'g');
      const count = (contentLower.match(regex) || []).length;
      score += count * 2;
    });
    
    return { ...chunk, score };
  });

  // 3. Filter and Sort
  // We need a decent threshold to avoid noise, but low enough to catch synonyms
  const bestMatches = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6) // Return top 6 most relevant sections
    .sort((a, b) => a.index - b.index); // Sort by document order (e.g., 1.1 before 1.4)

  // 4. Construct Response
  if (bestMatches.length === 0) {
    return "抱歉，我在手册中未找到相关内容。请尝试更换关键词，或切换到“全网搜索”模式。";
  }

  // Format the output nicely
  let response = `💡 **为您找到以下手册内容（离线模式）：**\n\n`;
  bestMatches.forEach((match, index) => {
    // Clean up markdown headers for display in chat
    // We remove the top-level # but keep bullet points
    let displayContent = match.content.replace(/^#+\s.*$/gm, '').trim(); 
    
    response += `**${match.title.split('-').pop()?.trim()}**\n${displayContent}\n\n`;
    if (index < bestMatches.length - 1) response += `---\n\n`;
  });

  return response;
};

// --- NETWORK AGENTS (GEMINI) ---

// SERVICE 2: Web Search Agent (External Knowledge)
export const askWebAgent = async (userQuery: string): Promise<{ text: string; groundingChunks?: any[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a helpful assistant for employees in Guinea.
              The user needs real-time information that is NOT in the static manual (e.g., current exchange rates, specific flight statuses, recent news).
              Use Google Search to find the answer.
              
              User Question: ${userQuery}`
            }
          ]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text || "未找到相关网络信息。",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Web Agent Error:", error);
    return { text: "网络搜索服务暂时不可用。" };
  }
};

// SERVICE 3: Map Explorer Agent (Location Intelligence)
export const askMapAgent = async (userQuery: string): Promise<{ text: string; groundingChunks?: any[]; location?: {lat: number, lng: number} }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a Location Guide for SPIC Guinea.
              The user wants to explore locations mentioned in their dispatch guide (Conakry, Boffa, Airports).
              
              1. Use the Google Maps tool to find details.
              2. Provide a helpful description.
              3. **CRITICAL**: If you identify a specific location, you MUST append its approximate GPS coordinates at the VERY END of your response in this strict format: 
                 {{LAT: 9.1234, LNG: -13.1234}}
                 
              User Question: ${userQuery}`
            }
          ]
        }
      ],
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    let text = response.text || "未找到地图信息。";
    let location = undefined;

    // Parse coordinates from text response
    const coordMatch = text.match(/\{\{LAT:\s*(-?\d+(\.\d+)?),\s*LNG:\s*(-?\d+(\.\d+)?)\}\}/);
    if (coordMatch) {
      location = {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[3])
      };
      // Remove the coord string from display text to keep it clean
      text = text.replace(coordMatch[0], '').trim();
    }

    return {
      text: text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      location: location
    };
  } catch (error) {
    console.error("Map Agent Error:", error);
    return { text: "地图服务暂时不可用。" };
  }
};
