import base64
import os

# Base64 encoded WAV files (very short, simple sounds)
sounds = {
    'click': 'UklGRqAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwAAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/',
    'erase': 'UklGRqAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA=',
    'toggle': 'UklGRqAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwAAACBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB',
    'move': 'UklGRqAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwAAACCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKC'
}

# Create audio directory if it doesn't exist
os.makedirs('audio', exist_ok=True)

# Save each sound effect
for name, data in sounds.items():
    output_path = f'audio/{name}.mp3'
    print(f'Creating {name}.mp3...')
    try:
        with open(output_path, 'wb') as f:
            f.write(base64.b64decode(data))
        print(f'Successfully created {name}.mp3')
    except Exception as e:
        print(f'Error creating {name}.mp3: {e}')
