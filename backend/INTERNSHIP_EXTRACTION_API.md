# Internship Extraction API

Extract structured internship data from any public internship webpage URL using AI.

## API Endpoint

```
POST /api/extract-internship
```

### Request

```json
{
  "url": "https://internshala.com/internship/details/..."
}
```

### Response

```json
{
  "title": "Web Development Intern",
  "stipend": "₹15,000/month",
  "location": "Remote",
  "eligibility": "Students pursuing B.Tech/BCA in Computer Science"
}
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `URL is required` | No URL provided in request body |
| 400 | `Invalid URL` | URL format is incorrect |
| 403 | `Access denied` | Page is protected/requires login |
| 404 | `Page not found` | URL does not exist |
| 422 | `Insufficient content` | Page requires JavaScript or is empty |
| 500 | `Configuration error` | OpenRouter API key not set |
| 503 | `AI service error` | OpenRouter API failed |
| 504 | `Timeout` | Request took too long |

---

## Frontend Usage Examples

### Using the Api helper (Recommended)

```typescript
import { Api } from '../services/api';

// Basic usage
const extractInternship = async () => {
  try {
    const data = await Api.extractInternship('https://internshala.com/internship/...');
    console.log(data);
    // { title: "...", stipend: "...", location: "...", eligibility: "..." }
  } catch (error) {
    console.error('Extraction failed:', error.message);
  }
};
```

### Using fetch directly

```typescript
const extractInternship = async (url: string) => {
  const response = await fetch('http://localhost:5000/api/extract-internship', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// Usage
const data = await extractInternship('https://example.com/internship');
```

### React Component Example

```tsx
import React, { useState } from 'react';
import { Api } from '../services/api';

interface InternshipData {
  title: string;
  stipend: string;
  location: string;
  eligibility: string;
}

const InternshipExtractor: React.FC = () => {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<InternshipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await Api.extractInternship(url);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter internship URL"
      />
      <button onClick={handleExtract} disabled={loading}>
        {loading ? 'Extracting...' : 'Extract Details'}
      </button>

      {error && <p className="error">{error}</p>}
      
      {data && (
        <div>
          <h3>{data.title}</h3>
          <p><strong>Stipend:</strong> {data.stipend}</p>
          <p><strong>Location:</strong> {data.location}</p>
          <p><strong>Eligibility:</strong> {data.eligibility}</p>
        </div>
      )}
    </div>
  );
};
```

---

## Token Optimization Notes

### Current Optimizations

1. **HTML Cleaning** - Removes all non-content elements:
   - `<script>`, `<style>`, `<noscript>`, `<iframe>`, `<svg>`
   - Navigation, header, footer, forms, buttons
   - Empty elements and HTML comments

2. **Text Truncation** - Smart truncation at 8000 characters:
   - Keeps first 4000 chars (usually contains main info)
   - Keeps last 4000 chars (often has eligibility/apply section)
   - Prevents token overflow with ~2000 token limit

3. **Low Temperature (0.1)** - Ensures consistent, deterministic extraction

4. **Limited Output Tokens (500)** - Prevents verbose AI responses

### Token Usage Estimate

| Component | Tokens (approx) |
|-----------|-----------------|
| System prompt | ~100 |
| User prompt template | ~100 |
| Page content (8000 chars) | ~2000 |
| Output | ~100 |
| **Total per request** | **~2300** |

### Cost Optimization Tips

1. **Cache responses** - Store extracted data to avoid re-fetching same URLs
2. **Validate URLs client-side** - Reject invalid URLs before API call
3. **Use smaller models** - Switch to lighter models for simple pages
4. **Batch requests** - If extracting multiple, consider batching (not implemented)

---

## Accuracy Improvements

### Current Strategies

1. **Explicit field extraction** - Asks for specific fields only
2. **"Not mentioned" default** - Returns this instead of guessing
3. **Main internship focus** - If multiple found, extracts primary one
4. **Low temperature** - Reduces creative/hallucinatory outputs

### Potential Improvements

1. **Multi-pass extraction** - First identify if page is internship, then extract
2. **Site-specific prompts** - Custom prompts for known sites (Internshala, LinkedIn, etc.)
3. **Confidence scoring** - Return confidence level for each field
4. **Validation layer** - Post-process to validate stipend format, location names, etc.
5. **Fallback to regex** - If AI fails, try regex patterns for common fields

### Known Limitations

1. **JavaScript-heavy sites** - Won't work on SPA sites that require JS execution
2. **Login-required pages** - Cannot access protected content
3. **Captcha/bot protection** - May be blocked by some sites
4. **Rate limits** - OpenRouter API has rate limits
5. **Non-English pages** - Accuracy may vary for non-English content

---

## Environment Setup

### Required Environment Variables

```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### Vercel Deployment

1. Add `OPENROUTER_API_KEY` to Vercel Environment Variables
2. This API uses `axios` for fetching (no Puppeteer required)
3. Compatible with Vercel Serverless Functions

### Local Development

```bash
# Create .env file in backend folder
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" > .env

# Start the server
npm run dev
```

---

## Supported Sites (Tested)

| Site | Status | Notes |
|------|--------|-------|
| Internshala | ✅ Works | Best accuracy |
| LinkedIn | ⚠️ Limited | May require login |
| Indeed | ✅ Works | Good accuracy |
| Naukri | ✅ Works | Good accuracy |
| Glassdoor | ⚠️ Limited | May show CAPTCHA |
| Company career pages | ✅ Works | Varies by site |
| AngelList/Wellfound | ✅ Works | Good accuracy |
| Unstop | ✅ Works | Good accuracy |

---

## API Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────>│  Backend    │────>│  Webpage    │     │  OpenRouter │
│  (Frontend) │     │  Server     │     │  (Target)   │     │     API     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │  POST /api/       │                   │                   │
      │  extract-intern.  │                   │                   │
      │  { url: "..." }   │                   │                   │
      │──────────────────>│                   │                   │
      │                   │                   │                   │
      │                   │  GET (axios)      │                   │
      │                   │──────────────────>│                   │
      │                   │                   │                   │
      │                   │  HTML response    │                   │
      │                   │<──────────────────│                   │
      │                   │                   │                   │
      │                   │  Clean HTML       │                   │
      │                   │  (cheerio)        │                   │
      │                   │                   │                   │
      │                   │  POST chat/       │                   │
      │                   │  completions      │                   │
      │                   │──────────────────────────────────────>│
      │                   │                   │                   │
      │                   │  JSON response    │                   │
      │                   │<──────────────────────────────────────│
      │                   │                   │                   │
      │  { title, stipend,│                   │                   │
      │    location,      │                   │                   │
      │    eligibility }  │                   │                   │
      │<──────────────────│                   │                   │
```
