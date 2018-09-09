!(function(window, undefined){
    function util() {
        this.$ = strQry => {
            return document.querySelector(strQry);
        };
        this.css = (...args) => {
           let cssText = '';
           for(let idx = 0; idx < args.length; idx +=2 ) {
               if (!!args[idx + 1]) {
                   cssText += `${args[idx]}: ${args[idx+1]};`
               }
           }
           return cssText;
        }
    }
    window.util = new util();
    console.log('util mounted done');
})(window, undefined);
