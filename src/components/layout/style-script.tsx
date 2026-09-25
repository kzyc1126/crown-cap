/**
 * Applies the saved style to <html> before paint so the page never flashes.
 * createPersistentStore writes JSON, so the value is parsed first.
 */
const script = `(function(){try{var raw=localStorage.getItem("cc-style");if(!raw)return;var s=JSON.parse(raw);if(s==="verdigris"||s==="plate"||s==="industry"||s==="lagoon"){document.documentElement.dataset.style=s;}}catch(e){}})();`;

export function StyleScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
