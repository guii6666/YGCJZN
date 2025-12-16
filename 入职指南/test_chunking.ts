
import { MANUAL_CHAPTERS } from './constants';

const chunkManualContent = () => {
  const chunks: { title: string, content: string, score: number }[] = [];
  
  MANUAL_CHAPTERS.forEach(chapter => {
    // Current Logic in geminiService.ts
    const sections = chapter.content.split(/\n(?=#{1,2}\s)/);
    
    sections.forEach(section => {
      const cleanSection = section.trim();
      if (cleanSection.length > 0) {
        let subTitle = chapter.title;
        const firstLine = cleanSection.split('\n')[0].replace(/^#+\s*/, '').trim();
        
        if (firstLine && firstLine.length < 50) {
          subTitle = `${chapter.title} - ${firstLine}`;
        }

        chunks.push({ 
          title: subTitle, 
          content: cleanSection, 
          score: 0 
        });
      }
    });
  });
  return chunks;
};

const chunks = chunkManualContent();
console.log("Total chunks:", chunks.length);

// Check 1.3 Packing specifically
const packingChunks = chunks.filter(c => c.content.includes("1.3 行李打包"));
packingChunks.forEach((c, i) => {
    console.log(`\n--- Chunk 1.3 Match ${i+1} ---`);
    console.log("Title:", c.title);
    console.log("Content Length:", c.content.length);
    console.log("Preview:", c.content.substring(0, 200).replace(/\n/g, '\\n'));
    // Check if it contains the sub-items
    console.log("Contains '公司统一配发':", c.content.includes("公司统一配发"));
    console.log("Contains '个人自备':", c.content.includes("个人自备"));
});

// Check if any chunk has title but almost no content
const emptyChunks = chunks.filter(c => c.content.split('\n').length <= 2 && c.content.length < 50);
if (emptyChunks.length > 0) {
    console.log("\nWARNING: Found potential empty chunks:");
    emptyChunks.forEach(c => console.log(`- ${c.title}: "${c.content}"`));
} else {
    console.log("\nNo empty chunks found.");
}
