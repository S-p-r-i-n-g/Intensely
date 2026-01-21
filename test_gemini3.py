#!/usr/bin/env python3
"""
Test Gemini 3 Flash Preview model
"""

import os
from google import genai
from google.genai import types


def test_gemini3():
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    client = genai.Client(api_key=api_key)

    model = "gemini-3-flash-preview"

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="Hello! What model are you? Please introduce yourself."),
            ],
        ),
    ]

    # Basic config - test without thinking config first
    generate_content_config = types.GenerateContentConfig()

    print("Testing Gemini 3 Flash Preview...\n")
    print("Response:")
    print("-" * 50)

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
            print(chunk.candidates[0].content.parts[0].text, end="")

    print("\n" + "-" * 50)
    print("\n✅ Gemini 3 Flash Preview is working!")


if __name__ == "__main__":
    test_gemini3()
