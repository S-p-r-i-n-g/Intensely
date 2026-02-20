# Gemini CLI Integration Guide
**Intensely Project | Version 1.0**

## Overview

The Google Gemini CLI is integrated into the Intensely project to assist with UI/UX design tasks, content generation, and creative exploration. This document outlines how to effectively use Gemini CLI throughout development.

---

## Installation & Setup

### Already Completed ✓
- Gemini CLI v0.23.0 installed globally
- Authentication configured in `~/.gemini/settings.json`
- API key set up

### Verify Installation
```bash
gemini --version
# Should output: 0.23.0 (or higher)
```

### Test Connection
```bash
gemini "Hello, respond with 'working'"
```

---

## Usage Modes

### 1. Interactive Mode (Recommended for Design)
```bash
# Start an interactive session
gemini

# Or with a project context
cd /Users/dspring/Projects/Intensely
gemini "Help me design UI for Intensely workout app"
```

### 2. One-Shot Mode (Quick Queries)
```bash
# Single prompt, get response, exit
gemini "Suggest 5 alternative names for the 'Jump Right In' button"
```

### 3. Non-Interactive with Context
```bash
# Pipe content to Gemini
cat design.md | gemini "Suggest improvements to the color palette for better accessibility"
```

---

## Design Use Cases

### 1. Color Palette Exploration

**Generate Alternative Palettes**
```bash
gemini "Generate 3 alternative color palettes for a fitness app called Intensely.
Include primary, secondary, and accent colors with hex codes.
Design philosophy: energetic, motivating, high-contrast for outdoor readability.
Format as JSON."
```

**Accessibility Audit**
```bash
gemini "Review this color palette for WCAG AAA compliance:
Primary: #FF0000
Background: #FFFFFF
Text: #0F172A
Suggest improvements if needed."
```

### 2. Component Design Ideas

**Button Variations**
```bash
gemini "Design 5 variations of a 'Start Workout' button for a mobile fitness app.
Consider: size, color, iconography, animation ideas.
Target: High-energy, instant action, mobile-optimized."
```

**Card Layouts**
```bash
gemini "Suggest 3 different layout patterns for exercise cards that display:
- Exercise thumbnail (200x200)
- Exercise name
- Difficulty level
- Target muscle groups
Format: Describe layout with Flexbox/React Native styles"
```

### 3. Typography Refinement

```bash
gemini "Review this typography scale for a mobile app:
xs: 12, sm: 14, base: 16, lg: 18, xl: 20, 2xl: 24, 3xl: 30, 4xl: 36
Suggest improvements for readability during workouts (viewing from 2-3 feet away)"
```

### 4. Animation Concepts

```bash
gemini "Suggest micro-interactions for these events in a workout timer app:
1. Timer starts (exercise begins)
2. 5 seconds remaining in interval
3. Exercise completes
4. Rest period begins
5. Workout completes

Describe timing, easing, and visual effects."
```

### 5. Empty State Content

```bash
gemini "Write copy for empty states in a workout app:
1. User has no saved workouts yet
2. Exercise search returns no results
3. No workout history

Tone: Motivating but not pushy, friendly, encouraging action"
```

### 6. Onboarding Flow Design

```bash
gemini "Design a 3-screen onboarding flow for Intensely workout app.
Screens should introduce:
1. Zero-friction 'Jump Right In' feature
2. Curated workout generation
3. Custom workout builder

Suggest headlines, body copy, and CTAs for each screen."
```

### 7. Icon Selection

```bash
gemini "Suggest appropriate icon names from Ionicons for these actions:
- Start workout
- Pause workout
- Skip exercise
- Add to favorites
- View workout history
- Create custom exercise
- Filter by muscle group

Provide icon names and reasoning."
```

### 8. Error Message Writing

```bash
gemini "Write user-friendly error messages for:
1. Network timeout during exercise data fetch
2. Failed to save workout (database error)
3. Invalid workout structure (missing exercises)
4. API rate limit exceeded

Tone: Helpful, non-technical, suggest solutions"
```

### 9. Design Critique

```bash
# Describe your design and ask for feedback
gemini "I designed a timer screen with:
- Black background
- 96px white countdown timer
- Exercise name in 36px
- Small circuit progress bar at top

Critique this design for a HIIT workout app. Consider readability, hierarchy, and UX."
```

### 10. Component Documentation

```bash
gemini "Generate component documentation for a React Native Button component with these props:
- variant: 'primary' | 'secondary' | 'ghost'
- size: 'small' | 'medium' | 'large'
- disabled: boolean
- onPress: function
- loading: boolean

Include usage examples and accessibility notes."
```

---

## Advanced Prompting Techniques

### Provide Context
```bash
gemini "Context: I'm building a mobile HIIT workout app for iOS/Android using React Native.

Task: Design a modal for user authentication with email/password and social login.

Constraints:
- Bottom sheet style (slides up from bottom)
- Support both sign up and login
- Minimal friction
- Follow iOS and Android design guidelines

Output: Describe layout, component structure, and provide React Native StyleSheet code."
```

### Request Specific Formats

**JSON Output**
```bash
gemini "Generate a workout objective list as JSON with this structure:
{ id, name, description, icon, recommendedStructure }
Provide 9 objectives."
```

**Code Snippets**
```bash
gemini "Generate React Native StyleSheet code for a Card component with:
- 16px padding
- 16px border radius
- Shadow elevation 3
- White background
Include dark mode variant."
```

**Markdown Tables**
```bash
gemini "Create a comparison table of button variants:
Columns: Variant, Use Case, Background, Text Color, Border
Rows: Primary, Secondary, Ghost, Large"
```

---

## Integration with Project Workflow

### During Design Phase
1. **Brainstorm**: Use Gemini for initial concept exploration
2. **Refine**: Get feedback on design decisions
3. **Document**: Generate component documentation
4. **Implement**: Reference `design.md` + Gemini suggestions

### During Development
1. **Content Generation**: Error messages, empty states, onboarding copy
2. **Accessibility Review**: Check contrast, suggest improvements
3. **Code Suggestions**: StyleSheet patterns, animation code
4. **Testing Ideas**: Edge cases, user scenarios

### Weekly Design Review
```bash
# Create a checkpoint prompt
gemini "Review the Intensely app design system (see design.md).
Suggest 3 improvements for:
1. Color palette
2. Component library
3. Motion design
Focus on mobile usability and fitness app best practices."
```

---

## Best Practices

### 1. Be Specific
❌ "Design a button"
✅ "Design a primary CTA button for starting a workout. Mobile-optimized, min 48px height, high energy, iOS + Android."

### 2. Provide Constraints
Include:
- Platform (iOS, Android, React Native)
- Size requirements
- Accessibility needs
- Brand guidelines
- Use case context

### 3. Iterate
```bash
# First pass
gemini "Suggest a color palette for a fitness app"

# Refine based on response
gemini "Take the previous palette and increase contrast for outdoor readability.
Make the primary color more energetic."
```

### 4. Request Multiple Options
```bash
gemini "Generate 5 different headline options for the 'Jump Right In' workout entry flow.
Tone: Energetic, confidence-building, action-oriented."
```

### 5. Use Examples
```bash
gemini "Design an exercise card similar to how Strava displays activities:
- Large thumbnail
- Title and metadata
- Clear CTAs
But optimized for HIIT exercises with difficulty and muscle group tags."
```

---

## Common Commands

### Design Generation
```bash
# Color palettes
gemini "Generate color palette for [context]"

# Component designs
gemini "Design [component] with [requirements]"

# Layout suggestions
gemini "Suggest layout for [screen] with [elements]"
```

### Content Writing
```bash
# Copy generation
gemini "Write [number] variations of [content type] for [context]"

# Error messages
gemini "Write user-friendly error message for [error scenario]"

# Onboarding
gemini "Create onboarding copy for [feature]"
```

### Code Assistance
```bash
# StyleSheet generation
gemini "Generate React Native styles for [component] with [requirements]"

# Animation code
gemini "Write animation code for [interaction] using React Native Animated"

# Component structure
gemini "Outline component structure for [feature]"
```

### Review & Feedback
```bash
# Design critique
gemini "Critique this design: [description]"

# Accessibility audit
gemini "Review accessibility of [component/screen]"

# Best practices
gemini "Suggest improvements for [aspect] following [guidelines]"
```

---

## Limitations & Workarounds

### Rate Limits (Free Tier)
- **Limit**: 5 requests per minute
- **Workaround**: Space out requests, use interactive mode for multi-turn conversations
- **Alternative**: Upgrade to paid tier at https://ai.google.dev/pricing

### Daily Quota
- **Issue**: Daily usage limits may apply
- **Solution**: Monitor usage, plan design sessions, cache responses for reference

### Context Window
- **Limitation**: Limited memory of previous interactions in one-shot mode
- **Solution**: Use interactive mode for related queries, provide full context in prompts

### No Visual Output
- **Limitation**: Gemini CLI is text-only (no image generation)
- **Workaround**: Request detailed descriptions, CSS/StyleSheet code, or use separate tools for mockups

---

## Tips for Effective Design with Gemini

1. **Start Broad, Then Narrow**: Begin with high-level concepts, then drill down to specifics

2. **Save Good Outputs**: Copy valuable responses to project docs for reference
   ```bash
   gemini "..." > design-ideas/color-palettes.md
   ```

3. **Combine with Human Judgment**: Use Gemini for exploration, but apply your design expertise

4. **Iterate on Responses**: Treat Gemini like a design partner—build on its suggestions

5. **Cross-Reference**: Compare Gemini suggestions with industry best practices and user research

6. **Document Decisions**: Add rationale to `design.md` when implementing Gemini's suggestions

7. **Test with Users**: Validate design ideas with real users, not just AI feedback

---

## Example: Complete Design Session

```bash
# Start interactive session
gemini

# Initial exploration
> "I'm designing a workout timer screen for Intensely, a HIIT app.
The screen needs to show:
- Large countdown timer
- Current exercise name
- Exercise demonstration (GIF/video)
- Circuit progress
- Pause/stop controls

Suggest a layout hierarchy and design approach."

# [Review response]

# Follow-up refinement
> "I like the layout. Now suggest specific typography sizes and colors
for optimal readability during intense workouts.
Consider users will be 2-3 feet from phone while exercising."

# [Review response]

# Code generation
> "Generate React Native StyleSheet code for the timer screen layout
you described, using Flexbox. Include dark mode support."

# [Copy code to project]

# Exit
> "exit"
```

---

## Checkpoint: Design System Populated

**Checkpoint ID**: DESIGN_SYSTEM_V1
**Date**: 2026-01-12
**Status**: Complete ✓

**Deliverables:**
- `design.md`: Comprehensive design system with tokens, components, patterns
- `GEMINI_WORKFLOW.md`: Integration guide for ongoing design work
- Gemini CLI installed and configured

**What's Working:**
- Complete color system (light + dark mode)
- Typography scale and text styles
- Spacing and layout tokens
- Component library patterns (buttons, cards, inputs, modals, timers)
- Motion and animation guidelines
- Accessibility standards
- Workout-specific design patterns

**Next Steps:**
1. Implement design tokens in React Native project (`mobile/src/tokens/`)
2. Create reusable UI components based on design system
3. Use Gemini CLI for ongoing design refinement and content generation
4. Reference `design.md` when building UI (as per CLAUDE.md instructions)

---

## Support & Resources

- **Gemini CLI Docs**: https://ai.google.dev/gemini-api/docs/cli
- **API Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits
- **Project Design System**: `/design.md`
- **This Guide**: `/GEMINI_WORKFLOW.md`

---

**Ready to Design!** 🎨

Use Gemini CLI whenever you need design inspiration, content generation, or creative problem-solving throughout the Intensely project.
