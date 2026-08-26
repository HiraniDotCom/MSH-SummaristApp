import React from 'react';

export default function ParagraphText({ text = "" }) {
  if (!text) return null;

  let paragraphs = [];

  if (text.includes('\n')) {
    paragraphs = text
      .split(/\r?\n/)
      .map(p => p.trim())
      .filter(p => p !== "");
  } 
  else {
    const sentences = text
      .split(/(?<=[.!?])\s+(?!(?<=u\.s\.|u\.s\.a\.|dr\.|mr\.|ms\.)\s*)/gi)
      .filter(s => s.trim() !== "");

    let currentParagraph = [];

    sentences.forEach((sentence) => {
      const isHeader = /^(part\s+(one|two|three)|key\s+themes|conclusion|introduction)/i.test(sentence.trim());

      if (isHeader && currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(" "));
        currentParagraph = [];
      }

      currentParagraph.push(sentence);

      if (currentParagraph.length >= sentencesPerParagraph || isHeader) {
        paragraphs.push(currentParagraph.join(" "));
        currentParagraph = [];
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(" "));
    }
  }

  return (
    <div className="relative ">
      <div className="space-y-5 text-gray-700 leading-relaxed text-justify pb-16">
        {paragraphs.map((paragraph, index) => {
          const isHeaderStyle = /^(part\s+(one|two|three)|key\s+themes|conclusion|introduction)/i.test(paragraph.trim());
          
          return (
            <p 
              key={index} 
              className={isHeaderStyle ? "text-lg font-bold text-gray-900 mt-6 mb-2 block" : ""}
            >
              {paragraph}
            </p>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
