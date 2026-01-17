---
trigger: always_on
---

1. Always use ui components available in '/components/ui/*'
2. Follow linting rules available in .oxlintrc.json
3. Fetch most of data on server-side with:
   ```ts
   createServerFn({method: "GET"})
   .inputValidator() // for validation
   .handler(async ({data /*return of inputValidator*/}) => {})
   ```
4. Use zod for all validations e.g. inputValidator, form validation
5. 