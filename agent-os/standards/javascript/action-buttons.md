# Action Button Standards

## Row action icons

Every icon-only action in a table row, a list row or a card header uses the same
two props. No exceptions, no per-module variation.

```tsx
// ✅ Correct
<Button size="icon-sm" variant="outline" title={t("editClassTitle")}>
	<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
</Button>

// ❌ Wrong — ghost has no boundary, so a row of actions reads as loose glyphs
<Button variant="ghost" size="icon">
	<Pencil className="size-4" />
</Button>

// ❌ Wrong — default size is built for a labelled button and makes rows tall
<Button size="icon" variant="outline">
	<Pencil className="size-4" />
</Button>
```

`icon-sm` keeps table rows compact, and `outline` gives every action a visible
hit target — which is what makes a row of three or four icons read as separate
controls rather than as decoration.

## The one exception: destructive actions

A delete keeps the size but takes the destructive variant, because removing a
record is the one action that should not look like its neighbours.

```tsx
<Button size="icon-sm" variant="destructive" title={t("deleteClassTitle")}>
	<Trash2 />
</Button>
```

## Always give an icon-only button a `title`

An icon with no label is unreadable to a screen reader and ambiguous to anyone
who has not used the screen before. The `title` is not optional.

```tsx
// ✅ Correct
<Button size="icon-sm" variant="outline" title={t("viewDetails")}>
	<Eye className="h-4 w-4" />
</Button>
```

## Two things this rule does NOT cover

**A dismiss affordance stays `ghost`.** The X that clears a resolved borrower,
removes a row from a basket or drops a picked file exists to get out of the
way. Outlining it puts a box around the one control that should recede.

```tsx
<Button variant="ghost" size="icon" onClick={reset} title={t("clear")}>
	<X className="size-4" />
</Button>
```

**A button paired with an input matches the input's height, not `icon-sm`.**
`Input` is `h-9` and `size="icon"` is `size-9`; `icon-sm` is `size-8` and would
sit a pixel short of the field beside it.

```tsx
<div className="flex gap-2">
	<Input ... />
	<Button variant="outline" size="icon" title={t("scanWithCamera")}>
		<Camera className="size-4" />
	</Button>
</div>
```

Both still take a `title`.

## Reference implementation

`src/modules/academics/classes/components/ClassList.tsx` — the actions column
there is the pattern every list should match: details, edit and delete as
`icon-sm` buttons, each with a `title`, delete in `destructive`.

## Labelled buttons are unaffected

This standard is about icon-only actions. A button that carries text keeps the
default size and whatever variant its prominence calls for — a primary create
action stays `<Button>`, a secondary toolbar action stays
`<Button variant="outline">`.
