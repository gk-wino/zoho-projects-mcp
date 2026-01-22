---
post_title: 'Zoho Projects WYSIWYG Editor Guide'
author1: 'MCP Development Team'
summary: 'Complete guide to using HTML-formatted descriptions and comments in Zoho Projects tasks using the WYSIWYG editor'
post_date: '2026-01-23'
---

## Overview

The Zoho Projects MCP Server supports rich text formatting in task descriptions and comments using HTML. This guide demonstrates how to create beautifully formatted content with headers, text styles, lists, code blocks, tables, links, and images.

## Basic Text Formatting

### Headers

Use HTML header tags to structure your content hierarchically.

**Example:**

```html
<h1>Main Project Header</h1>
<p>This is a regular paragraph with important information.</p>
<h2>Subheading for Details</h2>
<p>Another paragraph with more details.</p>
<h3>Smaller Heading</h3>
<p>Final paragraph in this section.</p>
```

**Usage:**

```typescript
await callTool(client, 'create_task', {
	project_id: projectId,
	name: 'Task with Headers',
	description: `
    <h1>Main Header</h1>
    <p>Description paragraph</p>
  `,
});
```

### Text Styles

Apply various text formatting styles using HTML tags and inline styles.

**Supported Styles:**

- **Bold**: `<strong>bold text</strong>`
- **Italic**: `<em>italic text</em>`
- **Underline**: `<u>underlined text</u>`
- **Combinations**: `<strong><em>bold and italic</em></strong>`

**Example:**

```html
<p>
	This paragraph contains <strong>bold text</strong>, <em>italic text</em>, and
	<u>underlined text</u>.
</p>
<p>
	We can also combine them: <strong><em>bold and italic</em></strong
	>.
</p>
<p>
	Even all three:
	<strong
		><em><u>bold, italic, and underlined</u></em></strong
	>!
</p>
```

### Text Colors

Apply text colors and background colors using inline styles.

**Text Color:**

```html
<span style="color: rgb(255, 0, 0);">red text</span>
<span style="color: rgb(0, 128, 0);">green text</span>
<span style="color: rgb(0, 0, 255);">blue text</span>
```

**Background Color:**

```html
<span style="background-color: rgb(255, 255, 0);">yellow background</span>
<span style="background-color: rgb(144, 238, 144);">light green background</span>
<span style="background-color: rgb(255, 192, 203);">pink background</span>
```

**Combined:**

```html
<strong>
	<span style="color: rgb(255, 255, 255); background-color: rgb(0, 0, 0);">
		bold white text on black background
	</span>
</strong>
```

## Lists

### Unordered Lists (Bullet Points)

Create bulleted lists using `<ul>` and `<li>` tags.

**Example:**

```html
<h3>Unordered List (Bullet Points)</h3>
<ul>
	<li>First item in the list</li>
	<li>Second item with <strong>bold text</strong></li>
	<li>Third item with <em>italic text</em></li>
	<li>Fourth item</li>
</ul>
```

### Ordered Lists (Numbered)

Create numbered lists using `<ol>` and `<li>` tags.

**Example:**

```html
<h3>Ordered List (Numbered)</h3>
<ol>
	<li>First step in the process</li>
	<li>Second step</li>
	<li>Third step with details</li>
	<li>Final step</li>
</ol>
```

### Nested Lists

Create hierarchical list structures by nesting lists within list items.

**Example:**

```html
<h3>Project Structure</h3>
<ul>
	<li>
		Main Category 1
		<ul>
			<li>Subcategory 1.1</li>
			<li>
				Subcategory 1.2
				<ul>
					<li>Sub-subcategory 1.2.1</li>
					<li>Sub-subcategory 1.2.2</li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		Main Category 2
		<ul>
			<li>Subcategory 2.1</li>
			<li>Subcategory 2.2</li>
		</ul>
	</li>
</ul>
```

## Code Formatting

### Inline Code

Use `<code>` tags for inline code snippets.

**Example:**

```html
<p>Inline code example: <code>const variable = 'value';</code></p>
```

### Multiline Code Blocks

For multiline code blocks, Zoho Projects uses a specific structure with ordered lists styled as code blocks.

**Structure:**

```html
<p>Code block example:</p>
<div>
	<p><br /></p>
	<ol class="code">
		<br />
	</ol>
	<p><br /></p>
</div>
<ul
	style="list-style-position:outside; list-style-type:decimal; padding:0 30px"
	dir="ltr"
>
	<li
		style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)"
	>
		function example() {<br />
	</li>
	<li
		style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)"
	>
		console.log('Hello, World!');<br />
	</li>
	<li
		style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)"
	>
		return true;<br />
	</li>
	<li
		style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)"
	>
		}<br />
	</li>
</ul>
<div><br /></div>
```

**Key Points:**

- Each line of code is a separate `<li>` element
- Each line ends with `<br/>`
- Must be preceded by `<div><p><br/></p><ol class="code"><br/></ol><p><br/></p></div>`
- Must be followed by `<div><br/></div>`

**Usage Example:**

```typescript
const codeBlock = `
  <p>Here's the implementation:</p>
  <div>
    <p><br/></p>
    <ol class="code"><br/></ol>
    <p><br/></p>
  </div>
  <ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">const handleSubmit = async (data) => {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  try {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    const response = await api.post('/users', data);<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    return response.data;<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  } catch (error) {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    console.error('Error:', error);<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  }<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">};<br/></li>
  </ul>
  <div><br/></div>
`;
```

### Preformatted Text

Use `<pre>` tags for preformatted text that preserves spacing and indentation.

**Example:**

```html
<p>Preformatted text:</p>
<pre>
This text preserves
    spaces and
        indentation
            exactly.</pre
>
```

## Links

Create hyperlinks using anchor tags.

**Example:**

```html
<p>Here are some useful links:</p>
<ul>
	<li>
		<a
			href="https://www.zoho.com/projects/"
			target="_blank"
			>Zoho Projects</a
		>
		- Project management tool
	</li>
	<li>
		<a
			href="https://github.com"
			target="_blank"
			>GitHub</a
		>
		- Code repository
	</li>
	<li>
		<a
			href="https://www.example.com"
			target="_blank"
			>Example Website</a
		>
		- Documentation
	</li>
</ul>
```

**Usage:**

```typescript
await callTool(client, 'create_task', {
	project_id: projectId,
	name: 'Task with Links',
	description: `
    <p>Check out <a href="https://example.com" target="_blank">this resource</a>.</p>
  `,
});
```

## Tables

Create formatted tables with headers, rows, and styled cells.

**Basic Table Structure:**

```html
<table
	border="1"
	cellpadding="5"
	cellspacing="0"
	style="border-collapse: collapse; width: 100%;"
>
	<thead>
		<tr style="background-color: rgb(240, 240, 240);">
			<th style="padding: 8px; text-align: left;"><strong>Column 1</strong></th>
			<th style="padding: 8px; text-align: left;"><strong>Column 2</strong></th>
			<th style="padding: 8px; text-align: left;"><strong>Column 3</strong></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="padding: 8px;">Row 1, Cell 1</td>
			<td style="padding: 8px;">Row 1, Cell 2</td>
			<td style="padding: 8px;">Row 1, Cell 3</td>
		</tr>
		<tr style="background-color: rgb(250, 250, 250);">
			<td style="padding: 8px;">Row 2, Cell 1</td>
			<td style="padding: 8px;">Row 2, Cell 2</td>
			<td style="padding: 8px;">Row 2, Cell 3</td>
		</tr>
	</tbody>
</table>
```

**Advanced Example with Status Indicators:**

```html
<h3>Feature Status Table</h3>
<table
	border="1"
	cellpadding="5"
	cellspacing="0"
	style="border-collapse: collapse; width: 100%;"
>
	<thead>
		<tr style="background-color: rgb(240, 240, 240);">
			<th style="padding: 8px; text-align: left;"><strong>Feature</strong></th>
			<th style="padding: 8px; text-align: left;"><strong>Status</strong></th>
			<th style="padding: 8px; text-align: left;"><strong>Priority</strong></th>
			<th style="padding: 8px; text-align: left;"><strong>Assignee</strong></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="padding: 8px;">User Authentication</td>
			<td style="padding: 8px;"><span style="color: rgb(0, 128, 0);">✓ Completed</span></td>
			<td style="padding: 8px;">High</td>
			<td style="padding: 8px;">John Doe</td>
		</tr>
		<tr style="background-color: rgb(250, 250, 250);">
			<td style="padding: 8px;">Dashboard UI</td>
			<td style="padding: 8px;"><span style="color: rgb(255, 165, 0);">⚠ In Progress</span></td>
			<td style="padding: 8px;">Medium</td>
			<td style="padding: 8px;">Jane Smith</td>
		</tr>
		<tr>
			<td style="padding: 8px;">API Integration</td>
			<td style="padding: 8px;"><span style="color: rgb(128, 128, 128);">○ Pending</span></td>
			<td style="padding: 8px;">High</td>
			<td style="padding: 8px;">Bob Johnson</td>
		</tr>
	</tbody>
</table>
```

## Images

Embed images from external URLs using `<img>` tags.

### Basic Image

```html
<p>Project architecture diagram:</p>
<img
	src="https://picsum.photos/id/0/600/300"
	alt="Architecture Diagram"
	style="max-width: 100%; height: auto; border: 1px solid rgb(200, 200, 200);"
/>
```

### Multiple Images with Styling

```html
<p>Technology stack icons:</p>
<img
	src="https://picsum.photos/id/9/150/150"
	alt="Technology 1"
	style="width: 150px; height: 150px; margin: 5px; border-radius: 8px;"
/>
<img
	src="https://picsum.photos/id/15/150/150"
	alt="Technology 2"
	style="width: 150px; height: 150px; margin: 5px; border-radius: 8px;"
/>
<img
	src="https://picsum.photos/id/20/150/150"
	alt="Technology 3"
	style="width: 150px; height: 150px; margin: 5px; border-radius: 8px;"
/>
```

**Usage:**

```typescript
await callTool(client, 'create_task', {
	project_id: projectId,
	name: 'Task with Images',
	description: `
    <h3>Screenshots</h3>
    <img src="https://picsum.photos/id/9/600/400" alt="Screenshot" style="max-width: 100%; height: auto;" />
  `,
});
```

**Image Sources:**

- Use [picsum.photos](https://picsum.photos/) for random placeholder images: `https://picsum.photos/id/9/200/300`
- Any publicly accessible image URL

## Complete Examples

### Example 1: Feature Implementation Task

```typescript
const description = `
  <h2>🎯 Complete Feature Implementation</h2>
  <p><strong>Priority:</strong> <em>High</em> | <strong>Status:</strong> <u>In Progress</u></p>
  
  <h3>Requirements</h3>
  <ol>
    <li><strong>Backend API</strong>
      <ul>
        <li>Create endpoints for <code>GET /api/users</code></li>
        <li>Implement <code>POST /api/users</code></li>
        <li>Add authentication middleware</li>
      </ul>
    </li>
    <li><strong>Frontend Components</strong>
      <ul>
        <li>Design user interface</li>
        <li>Implement state management</li>
      </ul>
    </li>
    <li><em>Testing & Documentation</em></li>
  </ol>
  
  <h3>Code Example</h3>
  <div>
    <p><br/></p>
    <ol class="code"><br/></ol>
    <p><br/></p>
  </div>
  <ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">const handleSubmit = async (data) => {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  try {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    const response = await api.post('/users', data);<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    return response.data;<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  } catch (error) {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    console.error('Error:', error);<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  }<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">};<br/></li>
  </ul>
  <div><br/></div>
  
  <p><strong>Note:</strong> Make sure to test all edge cases before deployment.</p>
`;

await callTool(client, 'create_task', {
	project_id: projectId,
	name: 'Implement User Management API',
	description: description,
	priority: 'high',
});
```

### Example 2: Documentation with Links and Images

```typescript
const description = `
  <h2>📚 API Documentation</h2>
  
  <h3>Resources</h3>
  <ul>
    <li><a href="https://api.example.com/docs" target="_blank">API Documentation</a></li>
    <li><a href="https://github.com/example/repo" target="_blank">GitHub Repository</a></li>
  </ul>
  
  <h3>Architecture Diagram</h3>
  <img src="https://picsum.photos/id/0/800/400" alt="System Architecture" style="max-width: 100%; height: auto; border: 1px solid rgb(200, 200, 200);" />
  
  <h3>Endpoints</h3>
  <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    <thead>
      <tr style="background-color: rgb(240, 240, 240);">
        <th style="padding: 8px; text-align: left;"><strong>Method</strong></th>
        <th style="padding: 8px; text-align: left;"><strong>Endpoint</strong></th>
        <th style="padding: 8px; text-align: left;"><strong>Description</strong></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px;"><code>GET</code></td>
        <td style="padding: 8px;"><code>/api/users</code></td>
        <td style="padding: 8px;">List all users</td>
      </tr>
      <tr style="background-color: rgb(250, 250, 250);">
        <td style="padding: 8px;"><code>POST</code></td>
        <td style="padding: 8px;"><code>/api/users</code></td>
        <td style="padding: 8px;">Create new user</td>
      </tr>
    </tbody>
  </table>
`;

await callTool(client, 'create_task', {
	project_id: projectId,
	name: 'Update API Documentation',
	description: description,
});
```

## Adding Comments with Formatting

Comments support the same HTML formatting as task descriptions.

**Example:**

```typescript
const comment = `
  <p>Here's the fix for the bug:</p>
  <div>
    <p><br/></p>
    <ol class="code"><br/></ol>
    <p><br/></p>
  </div>
  <ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">if (user.isAuthenticated()) {<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  return true;<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">}<br/></li>
    <li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">return false;<br/></li>
  </ul>
  <div><br/></div>
  <p>This should resolve the authentication issue.</p>
`;

await callTool(client, 'add_task_comment', {
	project_id: projectId,
	task_id: taskId,
	comment: comment,
});
```

## Best Practices

### Structure and Organization

1. **Use Headers**: Organize content with headers (`<h1>`, `<h2>`, `<h3>`)
2. **Paragraphs**: Wrap text in `<p>` tags for proper spacing
3. **Line Breaks**: Use `<p><br/></p>` for intentional spacing between sections
4. **Lists**: Use lists to break down complex information
5. **Section Spacing**: Add `<p><br/></p>` between major sections (after headers, tables, code blocks, images) to improve readability and visual hierarchy

### Styling Guidelines

1. **Consistent Colors**: Use RGB values for colors: `rgb(255, 0, 0)`
2. **Responsive Images**: Use `max-width: 100%` for images
3. **Table Borders**: Use `border-collapse: collapse` for clean tables
4. **Code Styling**: Always use the proper code block structure

### Code Blocks

1. **Always wrap** code blocks with the required `<div>` and `<ol class="code">` structure
2. **Each line** must be a separate `<li>` element
3. **End each line** with `<br/>`
4. **Close properly** with `<div><br/></div>`

### Performance

1. **External Images**: Use CDN-hosted images for better performance
2. **Image Sizes**: Optimize image dimensions (use picsum.photos with specific sizes)
3. **Avoid Large Tables**: Break large datasets into multiple tables or use pagination

## Testing

Run the WYSIWYG smoke tests to verify all formatting works:

```bash
npm run test:smoke:wysiwyg
```

This will create test tasks with all supported formatting options for manual verification in the Zoho Projects portal.

## References

- [Picsum Photos](https://picsum.photos/) - Random placeholder images
