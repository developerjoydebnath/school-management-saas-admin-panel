# Data Models

## Class-based Models

Use class instances to represent API data rather than using raw TypeScript interfaces directly on API responses.

```ts
// ✅ Correct
export class Teacher {
    constructor(data: any = {}) {
        this._id = data.id || "";
        this._mobileNumber = data.mobile || data.contact || "";
    }
}
const teacher = new Teacher(apiResponseData);

// ❌ Wrong
interface Teacher {
    id: string;
    mobileNumber: string;
}
const teacher: Teacher = apiResponseData; // Passes raw data directly
```

**Why:** Instantiating models ensures reliable default values, encapsulates derived properties, and provides a single place to map messy backend JSON (e.g. `data.contact`) to clean frontend camelCase properties (`mobileNumber`).

## Private Fields & Getters

Make all internal fields private (prefixed with `_`) and expose them exclusively via getter methods.

```ts
export class Teacher {
    private _id: string;

    constructor(data: any = {}) {
        this._id = data.id || "";
    }

    get id(): string {
        return this._id;
    }
}
```

**Why:** Using getters ensures that client-side components cannot accidentally mutate data models directly. State mutations must be handled by calling the API and triggering an SWR cache refresh, strictly preserving one-way data flow.

- Never provide setter methods.
- Assign all properties during instantiation in the `constructor`.

## The `.original` Property

Always store the unmapped, raw API response payload in a private `_original` property and expose it via an `original` getter.

```ts
export class Teacher {
    private _original: any;

    constructor(data: any = {}) {
        // map needed fields...
        this._original = data.original || data;
    }

    get original(): any {
        return this._original;
    }
}
```

**Why:** It acts as an escape hatch. Frontend models should only explicitly map fields actively used in the UI. Storing the raw payload ensures that if you need to `POST`/`PUT` the object back or access a rarely-used field, the data isn't lost.

- Use `data.original || data` to handle cases where a model might be instantiated from an already-mapped object.
