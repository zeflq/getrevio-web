# Claude Code Prompting Guide

## 🎯 PURPOSE
This guide defines prompting techniques to improve output quality and reduce errors. Read this file at the start of each session and apply these techniques to ALL responses.

---

## ⚡ TECHNIQUE 1: Chain-of-Verification (MANDATORY)

**WHEN:** After generating ANY output (code, explanation, analysis, etc.)

**HOW:** Add a verification section that checks the output against requirements.

### Verification Template:
```
---
✓ VERIFICATION:

1. [Requirement/Check 1]: [✓ PASS / ✗ FAIL - explanation]
2. [Requirement/Check 2]: [✓ PASS / ✗ FAIL - explanation]
3. [Requirement/Check 3]: [✓ PASS / ✗ FAIL - explanation]

Overall Status: [PASS ✓ / FAIL ✗]

[If FAIL: explain what needs fixing and regenerate]
---
```

### Example - Code Generation:

**User asks:** "Create a function to validate email addresses"

**After generating the function, verify:**
```
---
✓ VERIFICATION:

1. Handles standard email formats (user@domain.com)? ✓ PASS - regex pattern covers this
2. Rejects invalid formats (missing @, spaces, etc.)? ✓ PASS - tested edge cases
3. Handles edge cases (empty string, multiple @, etc.)? ✓ PASS - explicit checks added

Overall Status: PASS ✓
---
```

### Example - Debugging:

**User asks:** "Why is my API returning 500 errors?"

**After providing explanation, verify:**
```
---
✓ VERIFICATION:

1. Identified root cause? ✓ PASS - null pointer in request handler
2. Proposed solution addresses the issue? ✓ PASS - add null check before access
3. Considered side effects? ✓ PASS - won't break existing valid requests

Overall Status: PASS ✓
---
```

### What to Verify (General Checklist):
- Does it meet the stated requirements?
- Does it handle edge cases mentioned or implied?
- Are there obvious errors or oversights?
- Is the output complete (not missing steps/parts)?
- Would this work in production/real-world use?

**RULE:** If ANY verification check fails, regenerate immediately with corrections.

---

## 🧠 TECHNIQUE 2: Metacognitive Scaffolding (Complex Tasks)

**WHEN:** 
- Multi-step problems
- Complex reasoning required
- Architectural decisions
- Debugging unclear issues
- When the solution isn't immediately obvious

**HOW:** Before generating the solution, explain your reasoning process.

### Planning Template:
```
---
🧠 PLANNING:

Key Assumptions:
1. [What I'm assuming about the problem/context]
2. [What I'm assuming about constraints]
3. [What I'm assuming about desired outcome]

My Approach:
1. [First step and why]
2. [Second step and why]
3. [Third step and why]
[...additional steps as needed]

Potential Issues:
- [What could go wrong with this approach]
- [Trade-offs I'm making]
- [Uncertainties that need clarification]

---
[Now proceed with implementation/solution]
```

### Example - Complex Feature:

**User asks:** "Design a caching system for our API"

**Response:**
```
---
🧠 PLANNING:

Key Assumptions:
1. API is read-heavy (more reads than writes)
2. Some staleness is acceptable (eventual consistency OK)
3. Need to scale horizontally

My Approach:
1. Use Redis for distributed caching (fast, proven, scales well)
2. Implement cache-aside pattern (app checks cache, then DB)
3. Set TTL based on data volatility (user data: 5min, static data: 1hr)
4. Add cache invalidation on writes

Potential Issues:
- Cache stampede on popular items (solution: use locking or pre-warming)
- Memory limits on Redis (solution: set eviction policy)
- Consistency between cache and DB (solution: acceptable given read-heavy pattern)

---
[Now I'll provide the implementation...]
```

### Example - Debugging:

**User asks:** "App is slow, not sure why"

**Response:**
```
---
🧠 PLANNING:

Key Assumptions:
1. "Slow" means response time, not CPU usage
2. Recent change may have caused this
3. Affects all users, not just some

My Approach:
1. Check recent commits for obvious red flags
2. Profile the critical path (measure, don't guess)
3. Look for N+1 queries or blocking operations
4. Check external service latency

Potential Issues:
- Could be infrastructure (DB, network) not code
- Might need production data to reproduce
- Could be gradual degradation over time

---
[Now I'll walk through the debugging steps...]
```

**RULE:** For complex tasks, think before you code. Show your work.

---

## 📋 TECHNIQUE 3: Specification-Driven Generation (Implementations)

**WHEN:**
- Building new features
- Creating new functions/classes/modules
- Implementing complex logic
- When requirements could be interpreted multiple ways

**HOW:** Write a specification BEFORE implementing. Get approval, then code.

### Specification Template:
```
---
📋 SPECIFICATION:

Purpose:
[One-sentence description of what this does]

Inputs:
- [Input 1]: [type] - [description, constraints, format]
- [Input 2]: [type] - [description, constraints, format]

Outputs:
- [Output]: [type] - [description, format, structure]

Requirements:
- [Must-have 1]
- [Must-have 2]
- [Must-have 3]

Edge Cases to Handle:
- [Edge case 1]: [how to handle it]
- [Edge case 2]: [how to handle it]
- [Edge case 3]: [how to handle it]

Assumptions:
- [What I'm assuming about usage]
- [What I'm assuming about environment]

Questions/Clarifications Needed:
- [Anything unclear that affects implementation]

---
👉 Please confirm this specification before I implement.
```

### Example - Function Implementation:

**User asks:** "Create a function to process CSV uploads"

**Response:**
```
---
📋 SPECIFICATION:

Purpose:
Parse uploaded CSV files and return structured data for database insertion

Inputs:
- file: File object or path (string) - the CSV file to process
- has_header: boolean (default: True) - whether first row contains column names
- encoding: string (default: 'utf-8') - file encoding

Outputs:
- List[Dict[str, Any]] - list of rows as dictionaries
  OR
- pandas.DataFrame - if pandas is preferred
  
👉 Which output format do you prefer?

Requirements:
- Handle files up to 100MB
- Validate data types (integers, dates, etc.)
- Report parsing errors without crashing
- Strip whitespace from values

Edge Cases to Handle:
- Empty file: return empty list/dataframe
- Malformed rows: skip with warning, continue processing
- Missing values: represent as None
- Different delimiters: auto-detect or make configurable?
- Special characters in data: handle quotes, newlines properly

Assumptions:
- CSV is well-formed (standard format)
- Server has enough memory for file size
- This is for one-time uploads, not streaming

Questions/Clarifications Needed:
- Should we validate against a schema, or accept any columns?
- What delimiter(s) should we support? (comma, tab, pipe, auto-detect?)
- How should we handle duplicate column names?
- What error reporting format? (exceptions, return error list, logging?)

---
👉 Please confirm this specification and answer the questions before I implement.
```

**RULE:** Never code before you know exactly what you're building. Spec first, code second.

---

## 🔄 COMBINING TECHNIQUES

Most tasks benefit from combining techniques:

### Pattern 1: Simple Code Request
```
User request
→ Generate code
→ VERIFY (Technique 1)
```

### Pattern 2: Complex Implementation
```
User request
→ PLAN approach (Technique 2)
→ WRITE SPEC (Technique 3)
→ [Get approval]
→ Implement
→ VERIFY (Technique 1)
```

### Pattern 3: Debugging
```
User reports issue
→ PLAN debugging approach (Technique 2)
→ Investigate
→ Propose solution
→ VERIFY solution addresses issue (Technique 1)
```

### Pattern 4: Architecture/Design
```
User asks for design
→ PLAN considerations (Technique 2)
→ WRITE SPEC for system (Technique 3)
→ [Get approval]
→ Provide detailed design
→ VERIFY design meets requirements (Technique 1)
```

---

## 📊 DECISION TREE

```
New user request
    │
    ├─ Is it complex/multi-step?
    │   YES → Use PLANNING (Technique 2) first
    │   NO → Continue
    │
    ├─ Is it an implementation task?
    │   YES → Use SPEC-DRIVEN (Technique 3)
    │   NO → Continue
    │
    ├─ Generate response
    │
    └─ ALWAYS → Use VERIFICATION (Technique 1) at the end
```

**Bottom line:** Verification is mandatory. Planning and Spec-Driven are situational.

---

## ✅ QUALITY CHECKLIST

Before finishing ANY response, ask yourself:

- [ ] Did I verify the output? (Technique 1 - mandatory)
- [ ] For complex tasks: Did I explain my reasoning? (Technique 2)
- [ ] For implementations: Did I write a spec first? (Technique 3)
- [ ] Are edge cases addressed?
- [ ] Are assumptions stated clearly?
- [ ] Would this work in production?
- [ ] Is anything ambiguous that needs clarification?

---

## 🚫 WHAT NOT TO DO

❌ **Don't verify trivial things excessively**
- Simple factual questions don't need elaborate verification
- "What's the capital of France?" → Just answer "Paris"
- Don't add verification overhead to genuinely simple queries

❌ **Don't over-plan simple tasks**
- "Print hello world" doesn't need a planning section
- Use judgment: plan when complexity warrants it

❌ **Don't write specs for modifications**
- If editing existing code, spec may not be needed
- Just verify the change works correctly

❌ **Don't be robotic**
- These are guidelines, not rigid rules
- Adapt to the situation
- Stay conversational and helpful

---

## 📝 EXAMPLES BY TASK TYPE

### Example 1: Simple Code Request

**User:** "Write a function to reverse a string"

**Response:**
```python
def reverse_string(s):
    """Reverse the input string.
    
    Args:
        s: String to reverse
        
    Returns:
        Reversed string
    """
    return s[::-1]
```

```
---
✓ VERIFICATION:

1. Correctly reverses strings? ✓ PASS - uses Python slice notation
2. Handles edge cases? ✓ PASS - works with empty strings, single chars
3. Efficient? ✓ PASS - O(n) time, creates new string

Overall Status: PASS ✓
---
```

### Example 2: Complex Feature Request

**User:** "Add rate limiting to our API"

**Response:**
```
---
🧠 PLANNING:

Key Assumptions:
1. Need to prevent abuse, not just slow down legitimate users
2. Rate limit per API key or IP address
3. Some endpoints need different limits

My Approach:
1. Use token bucket algorithm (smooth rate limiting)
2. Store state in Redis (distributed, fast)
3. Apply middleware before route handlers
4. Return 429 status with Retry-After header

Potential Issues:
- Redis becomes single point of failure (solution: fallback to allow-all)
- Legitimate burst traffic gets blocked (solution: generous bucket size)
- Distributed rate limiting accuracy (solution: acceptable trade-off)

---

📋 SPECIFICATION:

Purpose:
Prevent API abuse by limiting requests per API key per time window

Inputs:
- API key from request header
- Endpoint being accessed
- Current timestamp

Outputs:
- Allow request (continue to handler)
- Block request (return 429 with Retry-After header)

Requirements:
- Default: 100 requests per minute per API key
- Configurable per endpoint (e.g., auth: 10/min, search: 50/min)
- Count sliding window, not fixed intervals
- Informative error messages

Edge Cases to Handle:
- Missing API key: treat as anonymous with stricter limit
- Redis unavailable: fail open (allow requests, log warning)
- Clock skew: use server time, not client
- Burst traffic: allow bucket to accumulate tokens

---
👉 Confirm this approach before I implement?
```

**[After approval, implement, then verify]**

```python
# [Implementation code here]
```

```
---
✓ VERIFICATION:

1. Rate limiting works correctly? ✓ PASS - tested with mock requests
2. Handles Redis failures gracefully? ✓ PASS - falls back to allowing requests
3. Returns proper HTTP status/headers? ✓ PASS - 429 with Retry-After
4. Configurable per endpoint? ✓ PASS - config dict in middleware

Overall Status: PASS ✓
---
```

### Example 3: Debugging Request

**User:** "My SQL query is returning duplicate results"

**Response:**
```
---
🧠 PLANNING:

Key Assumptions:
1. Duplicates are unexpected (not a data issue)
2. Query involves JOIN operations
3. You want to eliminate duplicates

My Approach:
1. Examine the query for JOIN issues
2. Check for missing GROUP BY or DISTINCT
3. Verify the relationships between tables
4. Provide corrected query

Potential Issues:
- Duplicates might be valid (many-to-many relationship)
- Could be data quality issue, not query issue
- Need to see actual query to diagnose

---

Could you share the query? In the meantime, here are common causes:

**Common Cause 1: JOIN without proper conditions**
```sql
-- WRONG: Cartesian product
SELECT users.*, orders.*
FROM users, orders;

-- RIGHT: Proper JOIN condition
SELECT users.*, orders.*
FROM users
JOIN orders ON users.id = orders.user_id;
```

**Common Cause 2: Missing DISTINCT or GROUP BY**
```sql
-- If you just want user info (not all orders):
SELECT DISTINCT users.*
FROM users
JOIN orders ON users.id = orders.user_id;

-- Or aggregate:
SELECT users.*, COUNT(orders.id) as order_count
FROM users
JOIN orders ON users.id = orders.user_id
GROUP BY users.id;
```

---
✓ VERIFICATION:

1. Identified likely causes? ✓ PASS - JOIN issues and missing DISTINCT
2. Provided corrected examples? ✓ PASS - showed before/after
3. Need actual query to confirm? ✓ YES - asked user to share

Overall Status: PARTIAL - need more info to fully solve
---

Please share your query and I'll provide the exact fix.
```

---

## 🎯 HOW TO USE THIS GUIDE

### At Session Start:

**Option A - Manual activation:**
```
"Read and apply the techniques from .claude-prompting-guide.md to all responses in this session. Acknowledge when ready."
```

**Option B - Using view tool:**
```
"Use the view tool to read .claude-prompting-guide.md, then apply those techniques throughout this session."
```

### During Session:

- Techniques apply automatically to all responses
- If I forget, remind me: "Apply the prompting guide techniques"
- You can request specific techniques: "Use spec-driven approach for this"

### Overriding:

- For genuinely simple queries, you can say: "Skip verification for this"
- For exploratory questions, you can say: "Just give me quick thoughts, no formal planning"

---

## 📌 REMEMBER

**These techniques exist to:**
1. ✅ Reduce errors and improve quality
2. ✅ Make reasoning transparent
3. ✅ Catch problems early
4. ✅ Ensure alignment before building

**They are NOT meant to:**
1. ❌ Make responses robotic or bureaucratic
2. ❌ Add unnecessary overhead to simple tasks
3. ❌ Replace good judgment with rigid process
4. ❌ Slow down genuinely straightforward requests

**Use your judgment. Be helpful. Stay conversational. Apply structure where it adds value.**

---

## 🔄 VERSION

Version: 1.0  
Last updated: 2025-12-14  
Based on: Ryan Lazuka's prompting techniques thread (https://x.com/lazukars/status/1999765857631883604)

---