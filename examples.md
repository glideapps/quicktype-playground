<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8">
  <title>quicktype Playground examples</title>
  <link rel="stylesheet" href="examples.css">
  <link rel="stylesheet" href="examples-highlight.css">
  <style>
  .markdown-body {
		max-width: 980px;
		margin: 50px auto;
	}
  </style>
  <script src="../playground.js"></script>
</head>
<body class="markdown-body">

# quicktype Playground demo

## Automatic initialization

Insert a `<script>` element into your page:

```html
<script src="https://unpkg.com/quicktype-playground@1"></script>
```

For instance following HTML element:

```html
<div class="quicktype" data-type-name="Person">
{
    "name": "Bob",
    "age": 99,
    "friends": ["Sue", "Vlad"]
}
</div>
```

Turns into:

<div class="quicktype" data-type-name="Person">

```json
{
  "name": "Bob",
  "age": 99,
  "friends": ["Sue", "Vlad"]
}
```

</div>

Specify which languages to display with `data-languages`:

```html
<div class="quicktype" data-type-name="Person" data-languages="C# Java Swift">
...
</div>
```

Turns into:

<div class="quicktype" data-type-name="Person" data-languages="C# Java Swift">

```json
{
  "pokemon": [
    {
      "id": 1,
      "num": "001",
      "name": "Bulbasaur",
      "img": "http://www.serebii.net/pokemongo/pokemon/001.png",
      "type": ["Grass", "Poison"],
      "weaknesses": ["Fire", "Ice", "Flying", "Psychic"],
      "next_evolution": [
        { "num": "002", "name": "Ivysaur" },
        { "num": "003", "name": "Venusaur" }
      ]
    },
    {
      "id": 2,
      "num": "002",
      "name": "Ivysaur",
      "img": "http://www.serebii.net/pokemongo/pokemon/002.png",
      "type": ["Grass", "Poison"],
      "weaknesses": ["Fire", "Ice", "Flying", "Psychic"],
      "prev_evolution": [{ "num": "001", "name": "Bulbasaur" }],
      "next_evolution": [{ "num": "003", "name": "Venusaur" }]
    }
  ]
}
```

</div>

</body>
</html>
