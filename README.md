# Smallest JSON equivalent in XML

[Read the full explanation on my blog](http://blog.vjeux.com/2013/xson-smallest-json-equivalent-in-xml)

## Get XSON

```html
<script src="https://raw.github.com/vjeux/XSON/master/src/xson.js"></script>
```

## Usage

### stringify

```javascript
XSON.stringify({"table":{"achievement":{"column":"instance","ascending":true}}}, null, '  ')
// Output:
```
```xml
<o>
  <o k="table">
    <o k="achievement">
      <s k="column">instance</s>
      <t k="ascending"/>
    </o>
  </o>
</o>
```

### parse

```javascript
XSON.parse('<o><o k="table"><o k="achievement"><s k="column">instance</s><t k="ascending"/></o></o></o>')

// Output:  {"table":{"achievement":{"column":"instance","ascending":true}}}
```

