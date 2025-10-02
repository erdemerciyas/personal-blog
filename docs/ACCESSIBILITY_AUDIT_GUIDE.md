# Accessibility Audit Guide - Admin UI/UX

Complete guide for conducting accessibility audits on the admin panel to ensure WCAG 2.1 AA compliance.

## Overview

This guide provides tools, techniques, and checklists for auditing the accessibility of the admin panel. Regular accessibility audits ensure the interface remains usable for all users, including those with disabilities.

## Automated Testing Tools

### 1. jest-axe (Already Integrated)

Automated accessibility testing in unit tests.

**Installation:**
```bash
npm install --save-dev jest-axe
```

**Usage:**
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<AdminButton>Click me</AdminButton>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Lighthouse (Chrome DevTools)

**How to Run:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"

**Target Score:** 90+ (Excellent)

**Common Issues Detected:**
- Missing alt text on images
- Insufficient color contrast
- Missing ARIA labels
- Form inputs without labels
- Missing focus indicators

### 3. axe DevTools Extension

**Installation:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)

**How to Use:**
1. Install extension
2. Open DevTools
3. Go to "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review violations

### 4. WAVE (Web Accessibility Evaluation Tool)

**Installation:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)

**How to Use:**
1. Navigate to admin page
2. Click WAVE extension icon
3. Review errors, alerts, and features
4. Fix issues identified

## Manual Testing

### Keyboard Navigation Testing

**Test All Pages:**
- [ ] Tab through all interactive elements
- [ ] Shift+Tab navigates backward
- [ ] Enter/Space activates buttons
- [ ] ESC closes modals and dropdowns
- [ ] Arrow keys navigate tabs and dropdowns
- [ ] Focus indicators are visible
- [ ] No keyboard traps

**Keyboard Shortcuts:**
```
Tab          - Next focusable element
Shift+Tab    - Previous focusable element
Enter/Space  - Activate button/link
ESC          - Close modal/dropdown
Arrow Keys   - Navigate tabs/dropdowns
Home/End     - First/last item in list
```

**Testing Checklist:**

**Dashboard Page:**
- [ ] Tab through stat cards
- [ ] Navigate to action buttons
- [ ] Access dropdown menus
- [ ] Navigate sidebar menu

**Forms (Users, Products, etc.):**
- [ ] Tab through all form fields
- [ ] Error messages are announced
- [ ] Submit button is accessible
- [ ] Cancel button is accessible
- [ ] Modal can be closed with ESC

**Tables (Videos, Portfolio, etc.):**
- [ ] Tab through table headers
- [ ] Navigate to action buttons
- [ ] Select checkboxes with keyboard
- [ ] Sort columns with Enter
- [ ] Navigate pagination

**Modals:**
- [ ] Focus trapped in modal
- [ ] ESC closes modal
- [ ] Focus returns to trigger element
- [ ] Tab cycles through modal elements

### Screen Reader Testing

**Recommended Screen Readers:**
- **NVDA** (Windows) - Free
- **JAWS** (Windows) - Commercial
- **VoiceOver** (macOS) - Built-in
- **TalkBack** (Android) - Built-in
- **VoiceOver** (iOS) - Built-in

**NVDA Testing (Windows):**

1. **Install NVDA:**
   - Download from [nvaccess.org](https://www.nvaccess.org/)
   - Install and launch

2. **Basic Commands:**
   ```
   NVDA+Q       - Quit NVDA
   Insert+Down  - Read current line
   Insert+Up    - Read from top
   Tab          - Next element
   H            - Next heading
   B            - Next button
   F            - Next form field
   T            - Next table
   ```

3. **Test Checklist:**
   - [ ] Page title is announced
   - [ ] Headings are announced with level
   - [ ] Buttons announce their purpose
   - [ ] Links announce destination
   - [ ] Form labels are read
   - [ ] Error messages are announced
   - [ ] Table headers are announced
   - [ ] Modal dialogs are announced
   - [ ] Loading states are announced

**VoiceOver Testing (macOS):**

1. **Enable VoiceOver:**
   - Press `Cmd+F5`
   - Or System Preferences > Accessibility > VoiceOver

2. **Basic Commands:**
   ```
   Cmd+F5           - Toggle VoiceOver
   VO+A             - Read all
   VO+Right/Left    - Navigate elements
   VO+Space         - Activate element
   VO+H             - Next heading
   VO+J             - Next form control
   ```

3. **Test Same Checklist as NVDA**

### Color Contrast Testing

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools (Inspect > Accessibility)

**WCAG 2.1 AA Requirements:**
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px or ≥ 14px bold): 3:1 minimum
- UI components: 3:1 minimum

**Test Combinations:**

**Light Mode:**
- [ ] `slate-900` on `white` (15.5:1) ✅
- [ ] `slate-600` on `white` (7.1:1) ✅
- [ ] `blue-600` on `white` (4.8:1) ✅
- [ ] `red-600` on `white` (5.1:1) ✅
- [ ] `green-600` on `white` (3.4:1) ✅

**Dark Mode:**
- [ ] `slate-100` on `slate-900` (14.8:1) ✅
- [ ] `slate-400` on `slate-900` (6.8:1) ✅
- [ ] `blue-400` on `slate-900` (7.2:1) ✅
- [ ] `red-400` on `slate-900` (6.5:1) ✅
- [ ] `green-400` on `slate-900` (5.8:1) ✅

### Focus Indicator Testing

**Requirements:**
- Focus indicators must be visible
- Minimum 2px outline or border
- Sufficient contrast (3:1 minimum)
- Not hidden by other elements

**Test Checklist:**
- [ ] All interactive elements have focus indicators
- [ ] Focus indicators are visible in light mode
- [ ] Focus indicators are visible in dark mode
- [ ] Focus indicators don't overlap content
- [ ] Custom focus styles meet contrast requirements

## WCAG 2.1 AA Compliance Checklist

### Perceivable

**1.1 Text Alternatives:**
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Icons have ARIA labels
- [ ] Complex images have detailed descriptions

**1.3 Adaptable:**
- [ ] Semantic HTML used (headings, lists, etc.)
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Form labels associated with inputs
- [ ] Tables have proper headers
- [ ] ARIA landmarks used (nav, main, aside)

**1.4 Distinguishable:**
- [ ] Color contrast meets requirements
- [ ] Color not sole means of conveying information
- [ ] Text can be resized to 200%
- [ ] No horizontal scrolling at 320px width
- [ ] Focus indicators visible

### Operable

**2.1 Keyboard Accessible:**
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Keyboard shortcuts don't conflict
- [ ] Focus order is logical

**2.2 Enough Time:**
- [ ] No time limits (or can be extended)
- [ ] Auto-updating content can be paused
- [ ] Session timeouts have warnings

**2.3 Seizures:**
- [ ] No flashing content (< 3 flashes per second)
- [ ] Animations can be disabled

**2.4 Navigable:**
- [ ] Skip links provided
- [ ] Page titles are descriptive
- [ ] Focus order is logical
- [ ] Link purpose is clear
- [ ] Multiple ways to find pages
- [ ] Headings and labels are descriptive
- [ ] Focus is visible

### Understandable

**3.1 Readable:**
- [ ] Page language is set (`lang="en"`)
- [ ] Language changes are marked
- [ ] Unusual words are defined

**3.2 Predictable:**
- [ ] Navigation is consistent
- [ ] Components behave consistently
- [ ] No unexpected context changes
- [ ] Forms have clear labels

**3.3 Input Assistance:**
- [ ] Error messages are clear
- [ ] Labels and instructions provided
- [ ] Error prevention for important actions
- [ ] Confirmation for destructive actions

### Robust

**4.1 Compatible:**
- [ ] Valid HTML (no parsing errors)
- [ ] ARIA used correctly
- [ ] Status messages announced
- [ ] Dynamic content updates announced

## Automated Audit Script

Create a script to run automated audits:

```javascript
// scripts/accessibility-audit.js
const { chromium } = require('playwright');
const { injectAxe, checkA11y } = require('axe-playwright');

async function auditPage(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  await injectAxe(page);
  
  const results = await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
  });
  
  await browser.close();
  return results;
}

// Audit all admin pages
const pages = [
  'http://localhost:3000/admin/dashboard',
  'http://localhost:3000/admin/videos',
  'http://localhost:3000/admin/users',
  // Add more pages...
];

(async () => {
  for (const url of pages) {
    console.log(`Auditing: ${url}`);
    await auditPage(url);
  }
})();
```

**Run:**
```bash
node scripts/accessibility-audit.js
```

## Common Issues and Fixes

### Issue 1: Missing Alt Text

**Problem:**
```tsx
<img src="/logo.png" />
```

**Fix:**
```tsx
<img src="/logo.png" alt="Company Logo" />
```

### Issue 2: Button Without Label

**Problem:**
```tsx
<button><XMarkIcon /></button>
```

**Fix:**
```tsx
<button aria-label="Close">
  <XMarkIcon />
</button>
```

### Issue 3: Form Input Without Label

**Problem:**
```tsx
<input type="text" placeholder="Name" />
```

**Fix:**
```tsx
<label htmlFor="name">Name</label>
<input id="name" type="text" placeholder="Name" />
```

### Issue 4: Insufficient Color Contrast

**Problem:**
```tsx
<p className="text-gray-400">Secondary text</p>
```

**Fix:**
```tsx
<p className="text-gray-600 dark:text-gray-400">Secondary text</p>
```

### Issue 5: Missing Focus Indicator

**Problem:**
```css
button:focus {
  outline: none;
}
```

**Fix:**
```css
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

## Audit Schedule

**Recommended Frequency:**
- **After major changes**: Immediate audit
- **Before releases**: Full audit
- **Monthly**: Spot checks
- **Quarterly**: Comprehensive audit

## Reporting Issues

When accessibility issues are found:

1. **Document the Issue:**
   - Page/component affected
   - WCAG criterion violated
   - Severity (Critical, High, Medium, Low)
   - Steps to reproduce
   - Suggested fix

2. **Prioritize:**
   - **Critical**: Blocks core functionality
   - **High**: Significant barrier
   - **Medium**: Moderate barrier
   - **Low**: Minor inconvenience

3. **Track Progress:**
   - Create GitHub issues
   - Assign to developers
   - Set deadlines
   - Verify fixes

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Testing](https://webaim.org/articles/contrast/)

## Conclusion

Regular accessibility audits ensure the admin panel remains usable for all users. Combine automated tools with manual testing for comprehensive coverage.

**Target:** WCAG 2.1 AA Compliance (95%+)

For questions or issues, refer to:
- [Component Library Guide](./COMPONENT_LIBRARY.md)
- [Design System Guide](./DESIGN_SYSTEM.md)
- [Final Verification Report](./FINAL_VERIFICATION_REPORT.md)
