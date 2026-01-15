#!/usr/bin/env python3
"""
Run design assessment using Gemini 3 Flash Preview
Assessing the UPDATED design system (after P0, P1, P2 fixes)
"""

import os
from google import genai
from google.genai import types


def run_assessment():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    client = genai.Client(api_key=api_key)

    model = "gemini-3-flash-preview"

    # Updated prompt with FIXED colors
    prompt = """
DESIGN SYSTEM ASSESSMENT REQUEST - POST-ACCESSIBILITY FIXES
==============================================================
Project: Intensely Mobile App
Design System: Version 1.1 (Updated with WCAG AA Compliance)
Assessment Date: 2026-01-13

CONTEXT:
--------
This is a React Native/Expo mobile fitness app called "Intensely" focused on High-Intensity Circuit Training (HICT).
The design system was recently updated with accessibility fixes based on Gemini 2.5 Pro's recommendations.
All P0, P1, and P2 improvements have been implemented.

YOUR TASK:
----------
Perform a comprehensive FOLLOW-UP assessment to verify improvements and identify any remaining opportunities:
1. Verify all accessibility fixes are working correctly
2. Check for any NEW issues introduced by the changes
3. Assess overall design cohesion after color adjustments
4. Identify advanced optimization opportunities
5. Validate mobile UX patterns
6. Suggest next-level refinements

=== UPDATED DESIGN SYSTEM (POST-FIXES) ===

COLOR PALETTE (UPDATED):
------------------------
Primary (Red - Energetic):
- 400: #F97066 (UPDATED for gradient)
- 500: #D92D20 (UPDATED - Main brand, WCAG AA: 4.54:1)
- 600: #B91C1C (UPDATED for hover/pressed)
- 700: #990000
- 800: #660000
- 900: #330000

Secondary (Slate - Balance):
- 50: #F8FAFC
- 100: #F1F5F9
- 200: #E2E8F0
- 300: #CBD5E1
- 400: #94A3B8
- 500: #64748B
- 600: #475569
- 700: #334155
- 800: #1E293B
- 900: #0F172A

Accent (Blue - Focus):
- 500: #1D4ED8 (UPDATED - WCAG AA: 4.79:1)
- 700: #1D4ED8

Semantic Colors (UPDATED):
- Success: #15803D (UPDATED - WCAG AA: 4.88:1)
- Warning: #F59E0B
- Error: #B91C1C (UPDATED - WCAG AA: 5.52:1)

LIGHT MODE THEME (UPDATED):
----------------------------
Background Primary: #F8FAFC (UPDATED - Soft white for eye strain reduction)
Background Secondary: #F8FAFC
Background Tertiary: #F1F5F9
Background Elevated: #FFFFFF (Pure white for cards/modals)
Text Primary: #0F172A (15.98:1 contrast ✅)
Text Secondary: #475569 (6.25:1 contrast ✅)
Text Tertiary: #526073 (UPDATED - 5.20:1 contrast ✅)
Border Light: #F1F5F9
Border Medium: #E2E8F0

DARK MODE THEME (UPDATED):
---------------------------
Background Primary: #0F172A
Background Secondary: #1E293B
Background Tertiary: #334155
Background Elevated: #1E293B
Text Primary: #F1F5F9 (UPDATED - Softer white for eye strain)
Text Secondary: #CBD5E1 (7.21:1 contrast ✅)
Text Tertiary: #64748B
Border Medium: #334155

TYPOGRAPHY SCALE:
-----------------
xs: 12px (Captions)
sm: 14px (Supporting)
base: 16px (Body default)
lg: 18px (Emphasized)
xl: 20px (Small headings)
2xl: 24px (Section headings)
3xl: 30px (Page titles)
4xl: 36px (Large titles)
5xl: 48px (Hero)
6xl-8xl: 60-96px (Timer displays)

Font Weights:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Black: 900

SPACING SYSTEM:
---------------
4px base scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
Touch Targets: 44px minimum (iOS HIG / WCAG AAA)
Border Radius: sm: 8px, md: 12px, lg: 16px

ASSESSMENT FOCUS AREAS:
=======================

1. VERIFY ACCESSIBILITY IMPROVEMENTS:
   - Confirm all color contrast ratios meet WCAG AA (4.5:1+)
   - Check that fixes didn't break visual hierarchy
   - Validate brand identity is maintained
   - Ensure colors still feel "energetic" for fitness context

2. ASSESS COLOR HARMONY:
   - Does the darker red (#D92D20) maintain brand energy?
   - Do the updated semantic colors work together?
   - Is the soft white background (#F8FAFC) a good choice?
   - Any color clashes or awkward combinations?

3. ADVANCED OPTIMIZATIONS:
   - Any remaining contrast issues?
   - Suggestions for AAA compliance (7:1)?
   - Color gradients or hover states improvements?
   - Dark mode refinements?

4. MOBILE FITNESS CONTEXT:
   - Outdoor readability with new colors
   - Glare reduction from soft backgrounds
   - Readability during high-intensity exercise
   - Sweaty hands / quick glances usability

5. DESIGN COHESION:
   - Does the updated system feel unified?
   - Any colors that feel out of place?
   - Brand consistency after changes?
   - Professional polish level?

6. NEXT-LEVEL REFINEMENTS:
   - Micro-animations opportunities
   - Shadow depth improvements
   - Gradient applications
   - Loading state polish
   - Empty state design
   - Error state clarity

OUTPUT REQUIREMENTS:
====================

# Gemini 3 Flash Preview Assessment Report
## Executive Summary
[Overall assessment of the UPDATED design system]
[Grade: A-F with justification]
[Key wins from the accessibility fixes]
[Any new concerns or opportunities]

## 1. Accessibility Verification
[Confirm all WCAG AA compliance ✅]
[List any remaining concerns]
[AAA compliance opportunities]

## 2. Visual Design Quality Post-Fixes
[How do the updated colors feel?]
[Brand energy maintained?]
[Professional appearance?]
[Fitness app appropriateness?]

## 3. Color Harmony Analysis
[Do colors work together?]
[Any clashing combinations?]
[Gradient opportunities?]
[Hover/pressed state colors?]

## 4. Mobile UX in Fitness Context
[Outdoor readability with new colors]
[Eye strain reduction effectiveness]
[Quick-glance usability]
[Motion/exercise readability]

## 5. Dark Mode Assessment
[Softer white text effectiveness]
[Contrast in dark mode]
[Eye strain in low light]
[Improvements needed?]

## 6. Advanced Optimization Opportunities
[What's next after P0/P1/P2?]
[P3 priorities]
[Polish suggestions]
[Future-proofing ideas]

## 7. Implementation Recommendations
[Specific next steps]
[Priority levels]
[Quick wins]
[Long-term enhancements]

IMPORTANT:
- Be thorough but concise
- Focus on what changed and what's next
- Validate that fixes were correct
- Suggest advanced refinements
- Consider fitness/workout context
- Think about user experience during exercise
"""

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        temperature=0.3,  # Lower for consistency
        max_output_tokens=8192,
    )

    print("🚀 Running Gemini 3 Flash Preview Design Assessment...")
    print("📊 Model: gemini-3-flash-preview-12-2025")
    print("=" * 70)
    print()

    full_response = ""

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.candidates is None
            or chunk.candidates[0].content is None
            or chunk.candidates[0].content.parts is None
        ):
            continue
        if chunk.candidates[0].content.parts[0].text:
            text = chunk.candidates[0].content.parts[0].text
            print(text, end="", flush=True)
            full_response += text

    print("\n")
    print("=" * 70)
    print("✅ Assessment complete!")

    # Save to file
    output_file = "GEMINI3_DESIGN_ASSESSMENT.md"
    with open(output_file, "w") as f:
        f.write(full_response)

    print(f"📄 Saved to: {output_file}")

    return full_response


if __name__ == "__main__":
    run_assessment()
