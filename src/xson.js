var XSON = {
    stringify: function (obj, replacer, space, type) {
        if (replacer) {
            throw new Exception('Replacer is not supported');
        }
                
        function rec(obj, level) {
            function indent(str) {
                if (space === undefined) {
                    return str;
                }
                return '\n' + Array(level + 1).join(space) + str;
            }
	    function encode(str) {
		return str
		    .replace(/\\/g, '\\\\')
		    .replace(/[\u0000-\u0008\u000b-\u001f&<>"\n\t]/g, function(c) {
			var hex = c.charCodeAt(0).toString(16);
			while (hex.length < 4) {
			    hex = '0' + hex;
			}
			return '\\u' + hex;
		    });
	    }
            
            if (typeof obj === 'string') {
		if (!obj.length) {
                    return indent(type === 'html' ? '<s></s>' : '<s/>');
		}
                return indent('<s>' + encode(obj) + '</s>');
            }
            
            if (obj === null || obj === undefined) {
                return indent(type === 'html' ? '<l></l>' : '<l/>');
            }
            
            if (typeof obj === 'boolean') {
                if (obj) {
                    return indent(type === 'html' ? '<t></t>' : '<t/>');
                }
                return indent(type === 'html' ? '<f></f>' : '<f/>');
            }
            
            if (typeof obj === 'number') {
		if (obj !== obj) {
                    return indent(type === 'html' ? '<n></n>' : '<n/>');
		}
                return indent('<n>' + obj + '</n>');
            }
            
            if ('slice' in obj) {
                if (!obj.length) {
                    return indent(type === 'html' ? '<a></a>' : '<a/>');
                }
                return indent('<a>') + obj.map(function (obj) {
                    return rec(obj, level + 1);
                }).join('') + indent('</a>');
            }
            
            var elements = [];
            for (var key in obj) {
                var element = rec(obj[key], level + 1);
                var pos = space === undefined ? 2 : space.length * (level + 1) + 3;
                elements.push(element.substr(0, pos) + ' k="' + encode(key) + '"' + element.substr(pos));
            }
            if (!elements.length) {
                return indent(type === 'html' ? '<o></o>' : '<o/>');
            }
            return indent('<o>') + elements.join('') + indent('</o>');
        }
        
        return rec(obj, 0).substr(space === undefined ? 0 : 1);
    },
    
    parse: function (str) {
        var element = new DOMParser().parseFromString(str, 'text/xml');
        
        function childrenToArray(element) {
            return Array.prototype.slice.apply(element.childNodes)
                .filter(function (child) { return child.nodeType !== 3; });
        }

	function decode(str) {
	    return str
	        .replace(/(\\*)\\u([0-9a-f]{4})/g, function(_, backslash, n) {
		    if (backslash.length % 2 === 0) {
			return backslash + String.fromCharCode(parseInt(n, 16));
		    }
		    return backslash + '\\u' + n;
		})
	        .replace(/\\\\/g, '\\');
	}
        
        function rec(element) {
            if (element.tagName === 's') {
                return decode(element.textContent);
            }
            
            if (element.tagName === 't') {
                return true;
            }
            
            if (element.tagName === 'f') {
                return false;
            }
            
            if (element.tagName === 'l') {
                return null;
            }
            
            if (element.tagName === 'n') {
                return parseFloat(element.textContent);
            }
            
            if (element.tagName === 'a') {
                return childrenToArray(element).map(rec);
            }
            
            if (element.tagName === 'o') {
                var result = {};
                childrenToArray(element).forEach(function (child) {
                    result[decode(child.getAttribute('k'))] = rec(child);
                });
                return result;
            }
            
            throw new 'Invalid tag: ' + element.tagName;
        }
        
        return rec(element.firstChild);
     }
};

if (typeof exports !== 'undefined') {
	exports.stringify = XSON.stringify;
	exports.parse = XSON.parse;
}
