export const formatLatex = (text) => {
    if (!text) return '';
    
    let normalized = text
      .replace(/\\{4,}/g, '\\\\') 
      .replace(/\\\\\\\\/g, '\\\\') 
      .replace(/\\\\/g, '\\'); 
  
    return normalized;
};

export const formatLatexForReport = (text) => {
    if (!text) return '';
    
    return text
        .replace(/\\\(/g, '') 
        .replace(/\\\)/g, '') 
        .replace(/\\\[/g, '')
        .replace(/\\\]/g, '') 
        .replace(/\\\\/g, '') 
        .replace(/\\/g, '')   
        .trim();
};
  
  export const configureMathJax = () => {
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true,
      },
      svg: {
        fontCache: 'global'
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        processHtmlClass: 'math-tex'
      }
    };
  };
  
  export const renderMathJax = async () => {
    if (window.MathJax) {
      try {
        await window.MathJax.typesetClear();
        await window.MathJax.typesetPromise();
        console.log("MathJax rendering completed successfully");
      } catch (error) {
        console.error("MathJax rendering failed:", error);
      }
    }
  };

  export const renderMathContent = (content) => {
    if (!content) return '';
    const formattedContent = formatLatex(content);
    return formattedContent;
  };

  export const initMathJax = () => {
    if (window.MathJax) {
      window.MathJax.typesetClear();
      return window.MathJax.typesetPromise()
        .then(() => {
          console.log("MathJax rendering complete");
        })
        .catch((err) => {
          console.error("MathJax rendering error:", err);
        });
    }
    return Promise.resolve();
  };