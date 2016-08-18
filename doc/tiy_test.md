This is a test
--------------

This file is to test the "tri-it-yourself" (tiy) script.

Here is a box with code that the user can edit and run:

<pre class="tiy">
d3.select("body").text("ABC");
</pre>

And here is another one:

<pre class="tiy">
d3.select("body").text("ABC");
</pre>

Compile this markdown file with

```
pandoc tiy_test.md -o tiy_test.html
```

And that's it.

<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="tiy.js"></script>
<link rel="stylesheet" href="tiy.css">
<script>tiy.make_boxes();</script>

