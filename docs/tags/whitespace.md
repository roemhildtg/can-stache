@page can-stache.tags.whitespace {{-expression-}}
@parent can-stache.tags 8

@description Omit whitespace from around the output of the template.

@signature `{{-EXPRESSION-}}`

  Whitespace may be omitted from either or both ends of a magic tag by including a
  `-` character by the braces. When present, all whitespace on that side will be
  omitted up to the next tag, magic tag, or non-whitespace character. It also works with [can-stache.tags.unescaped].

  The following ensures there is no extra between the second `<pre>`, the output of `{{-this.message-}}`,
  and the `</pre>` closing tag:

  ```html
  <my-demo></my-demo>
  <style>
  pre {border: solid 1px;}
  </style>
  <script type="module">
  import {Component} from "can";

  Component.extend({
    tag: "my-demo",
    view: `
      <pre>
        {{this.message}}
      </pre>
      <pre>
        {{- this.message -}}
      </pre>`,
    ViewModel: {
      message: {default: "Hi There!"}
    }
  });
  </script>
  ```
  @codepen

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} EXPRESSION An expression whose unescaped result is inserted into the page.

@body

## Examples

### Basic Usage

```html
<div>
	{{-# if(user.isMarried) -}}
		Mrs
	{{- else -}}
		Miss
	{{-/ if -}}
</div>
```

would render as:

```html
<div>{{# if(user.isMarried) }}Mrs{{ else }}Miss{{/ if }}</div>
```

and

```html
<div>
	{{{- toMarkdown(content) -}}}
</div>
```

would render as:

```html
<div>{{{ toMarkdown(content) }}}</div>
```

### Span Elements

One use case is to remove spaces around span elements.

```html
<div>
	<span>
		{{-# if(user.isMarried) -}}
			Mrs.
		{{- else -}}
			Miss.
		{{-/ if -}}
	</span>
	{{- user.name }}
</div>
```

would render as:

```html
<div>
	<span>{{#if(user.isMarried)}}Mrs.{{else}}Miss.{{/if}}</span>{{ user.name }}
</div>
```

### Empty Elements

Another would be to assure that empty elements are able to match the `:empty`
css pseudo-class (the whitespace that would be otherwise present prevents this),
while still being cleanly formatted for human consumption.

```html
<div>
	{{-! output the users name }}
	{{-# if(user.name) }}
		{{ user.name }}
	{{/ if -}}
</div>
```

would render as:

```html
<div>{{-! output the users name }}{{-# if(user.name) }}
		{{ user.name }}
	{{/ if -}}</div>
```
